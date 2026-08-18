import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SERVICES, TIME_SLOTS } from "@/lib/booking/mockData";
import { computeAvailability, slotCountForService } from "@/lib/booking/availability";
import { getTodayBangkok, parseDateInWindow } from "@/lib/booking/today";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  const serviceId = request.nextUrl.searchParams.get("serviceId");

  if (!dateParam || !serviceId) {
    return NextResponse.json({ error: "MISSING_PARAMS" }, { status: 400 });
  }

  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ error: "UNKNOWN_SERVICE" }, { status: 400 });
  }

  const date = parseDateInWindow(dateParam, getTodayBangkok());
  if (!date) {
    return NextResponse.json({ error: "DATE_OUT_OF_RANGE" }, { status: 400 });
  }

  const existing = await prisma.booking.findMany({
    where: { date, status: "CONFIRMED" },
    select: { startSlotIndex: true, slotCount: true },
  });

  const availableFlags = computeAvailability(existing, slotCountForService(service));
  const slots = TIME_SLOTS.map((time, i) => ({ time, available: availableFlags[i] }));

  return NextResponse.json({ date: dateParam, serviceId, slots });
}
