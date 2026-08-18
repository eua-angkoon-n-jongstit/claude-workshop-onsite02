import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SERVICES, TIME_SLOTS } from "@/lib/booking/mockData";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : undefined;

  const bookings = await prisma.booking.findMany({
    where: date ? { date } : undefined,
    orderBy: [{ date: "asc" }, { startSlotIndex: "asc" }],
  });

  const serviceById = new Map(SERVICES.map((s) => [s.id, s]));

  return NextResponse.json(
    bookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      serviceId: b.serviceId,
      serviceName: serviceById.get(b.serviceId)?.name ?? b.serviceId,
      date: b.date.toISOString().slice(0, 10),
      time: TIME_SLOTS[b.startSlotIndex] ?? null,
      slotCount: b.slotCount,
      name: b.name,
      phone: b.phone,
      note: b.note,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
  );
}
