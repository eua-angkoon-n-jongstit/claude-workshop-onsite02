import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SERVICES, TIME_SLOTS } from "@/lib/booking/mockData";
import { validatePhone } from "@/lib/booking/validation";
import { computeAvailability, slotCountForService } from "@/lib/booking/availability";
import { generateBookingCode } from "@/lib/booking/bookingCode";
import { getTodayBangkok, parseDateInWindow } from "@/lib/booking/today";

const bodySchema = z.object({
  serviceId: z.string(),
  date: z.string(),
  time: z.string(),
  name: z.string(),
  phone: z.string(),
  note: z.string().optional(),
});

class SlotUnavailableError extends Error {}

const MAX_CODE_RETRIES = 5;
const MAX_CONFLICT_RETRIES = 3;

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR", fields: {} }, { status: 400 });
  }
  const { serviceId, date: dateParam, time, name, phone, note } = parsed.data;

  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ error: "UNKNOWN_SERVICE" }, { status: 400 });
  }

  const date = parseDateInWindow(dateParam, getTodayBangkok());
  if (!date) {
    return NextResponse.json({ error: "DATE_OUT_OF_RANGE" }, { status: 400 });
  }

  const startSlotIndex = TIME_SLOTS.indexOf(time);
  if (startSlotIndex === -1) {
    return NextResponse.json({ error: "INVALID_TIME" }, { status: 400 });
  }

  const slotCount = slotCountForService(service);
  if (startSlotIndex + slotCount > TIME_SLOTS.length) {
    return NextResponse.json({ error: "OVERFLOWS_CLOSING" }, { status: 400 });
  }

  const trimmedName = name.trim();
  const fieldErrors: Record<string, string> = {};
  if (trimmedName.length === 0) fieldErrors.name = "required";
  if (!validatePhone(phone)) fieldErrors.phone = "invalid";
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "VALIDATION_ERROR", fields: fieldErrors }, { status: 400 });
  }

  try {
    const booking = await createBookingWithRetry({
      date,
      startSlotIndex,
      slotCount,
      serviceId,
      name: trimmedName,
      phone,
      note: note ?? "",
    });

    return NextResponse.json(
      {
        bookingCode: booking.bookingCode,
        serviceId,
        date: dateParam,
        time,
        name: trimmedName,
        phone,
        note: note ?? "",
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return NextResponse.json({ error: "SLOT_UNAVAILABLE" }, { status: 409 });
    }
    throw err;
  }
}

async function createBookingWithRetry(input: {
  date: Date;
  startSlotIndex: number;
  slotCount: number;
  serviceId: string;
  name: string;
  phone: string;
  note: string;
}) {
  for (let conflictAttempt = 0; conflictAttempt < MAX_CONFLICT_RETRIES; conflictAttempt++) {
    for (let codeAttempt = 0; codeAttempt < MAX_CODE_RETRIES; codeAttempt++) {
      const bookingCode = generateBookingCode(input.date);
      try {
        return await prisma.$transaction(
          async (tx) => {
            const existing = await tx.booking.findMany({
              where: { date: input.date, status: "CONFIRMED" },
              select: { startSlotIndex: true, slotCount: true },
            });
            const available = computeAvailability(existing, input.slotCount)[input.startSlotIndex];
            if (!available) throw new SlotUnavailableError();

            return tx.booking.create({
              data: {
                bookingCode,
                serviceId: input.serviceId,
                date: input.date,
                startSlotIndex: input.startSlotIndex,
                slotCount: input.slotCount,
                name: input.name,
                phone: input.phone,
                note: input.note || null,
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (err) {
        if (err instanceof SlotUnavailableError) throw err;
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          // booking code collision — regenerate and retry
          continue;
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
          // serializable transaction conflict — break to outer loop for a fresh attempt
          break;
        }
        throw err;
      }
    }
  }
  throw new SlotUnavailableError();
}
