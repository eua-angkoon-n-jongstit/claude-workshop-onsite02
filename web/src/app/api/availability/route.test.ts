import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { POST as createBooking } from "../bookings/route";
import { prisma } from "@/lib/prisma";
import { getTodayBangkok, buildDateWindow, toISODate } from "@/lib/booking/today";

const dates = buildDateWindow(getTodayBangkok());
const validDateISO = toISODate(dates[1]);

function availabilityRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/availability");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

function bookingRequest(body: unknown) {
  return new NextRequest("http://localhost/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  await prisma.booking.deleteMany();
});

afterAll(async () => {
  await prisma.booking.deleteMany();
  await prisma.$disconnect();
});

describe("GET /api/availability", () => {
  it("marks every slot available with no existing bookings", async () => {
    const res = await GET(availabilityRequest({ date: validDateISO, serviceId: "cut" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slots.every((s: { available: boolean }) => s.available)).toBe(true);
  });

  it("marks all consecutive slots unavailable after a multi-slot booking", async () => {
    await createBooking(
      bookingRequest({
        serviceId: "perm",
        date: validDateISO,
        time: "10:00",
        name: "ทดสอบ",
        phone: "0812345678",
        note: "",
      }),
    );

    const res = await GET(availabilityRequest({ date: validDateISO, serviceId: "cut" }));
    const data = await res.json();
    const byTime = Object.fromEntries(
      data.slots.map((s: { time: string; available: boolean }) => [s.time, s.available]),
    );

    expect(byTime["09:30"]).toBe(true);
    expect(byTime["10:00"]).toBe(false);
    expect(byTime["10:30"]).toBe(false);
    expect(byTime["11:00"]).toBe(false);
    expect(byTime["11:30"]).toBe(true);
  });

  it("rejects an unknown service", async () => {
    const res = await GET(availabilityRequest({ date: validDateISO, serviceId: "nope" }));
    expect(res.status).toBe(400);
  });

  it("rejects a date outside the booking window", async () => {
    const res = await GET(availabilityRequest({ date: "2000-01-01", serviceId: "cut" }));
    expect(res.status).toBe(400);
  });
});
