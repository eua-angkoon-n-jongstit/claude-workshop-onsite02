import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { getTodayBangkok, buildDateWindow, toISODate } from "@/lib/booking/today";

const dates = buildDateWindow(getTodayBangkok());
const validDateISO = toISODate(dates[1]); // tomorrow — safely inside the 14-day window regardless of when this runs

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  serviceId: "cut",
  date: validDateISO,
  time: "10:00",
  name: "ทดสอบ",
  phone: "0812345678",
  note: "",
};

beforeEach(async () => {
  await prisma.booking.deleteMany();
});

afterAll(async () => {
  await prisma.booking.deleteMany();
  await prisma.$disconnect();
});

describe("POST /api/bookings", () => {
  it("creates a booking on the happy path", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.bookingCode).toMatch(/^BK\d{4}-\d{4}$/);

    const rows = await prisma.booking.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].slotCount).toBe(1);
  });

  it("rejects an already-booked slot with 409", async () => {
    await POST(makeRequest(validBody));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("SLOT_UNAVAILABLE");
  });

  it("exactly one of two concurrent requests for the identical slot succeeds", async () => {
    const [a, b] = await Promise.all([POST(makeRequest(validBody)), POST(makeRequest(validBody))]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);

    const rows = await prisma.booking.findMany();
    expect(rows).toHaveLength(1);
  });

  it("blocks all consecutive slots for a multi-slot service (decision #2)", async () => {
    // ดัดผม (perm) is 90 min => 3 slots: 10:00, 10:30, 11:00
    const first = await POST(makeRequest({ ...validBody, serviceId: "perm", time: "10:00" }));
    expect(first.status).toBe(201);

    const overlapping = await POST(makeRequest({ ...validBody, serviceId: "cut", time: "10:30" }));
    expect(overlapping.status).toBe(409);

    const stillOpen = await POST(makeRequest({ ...validBody, serviceId: "cut", time: "11:30" }));
    expect(stillOpen.status).toBe(201);
  });

  it("rejects an unknown service", async () => {
    const res = await POST(makeRequest({ ...validBody, serviceId: "does-not-exist" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("UNKNOWN_SERVICE");
  });

  it("rejects a date outside the booking window", async () => {
    const res = await POST(makeRequest({ ...validBody, date: "2000-01-01" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("DATE_OUT_OF_RANGE");
  });

  it("rejects a start time whose span would overflow closing (decision #5)", async () => {
    // ดัดผม (90 min = 3 slots) starting at the grid's last slot (19:00) overflows
    const res = await POST(makeRequest({ ...validBody, serviceId: "perm", time: "19:00" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("OVERFLOWS_CLOSING");
  });

  it("rejects an invalid phone", async () => {
    const res = await POST(makeRequest({ ...validBody, phone: "12345" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("VALIDATION_ERROR");
    expect(data.fields.phone).toBeDefined();
  });

  it("rejects a blank name", async () => {
    const res = await POST(makeRequest({ ...validBody, name: "   " }));
    expect(res.status).toBe(400);
    expect((await res.json()).fields.name).toBeDefined();
  });
});
