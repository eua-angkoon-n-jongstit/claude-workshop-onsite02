import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// The route's own authorization gate is what these tests exercise — NextAuth's
// session issuance/cookie machinery is a well-tested third-party concern, not ours.
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn() }));

import { getServerSession } from "next-auth/next";
import { GET as listBookings } from "./route";
import { PATCH as cancelBooking } from "./[id]/route";
import { POST as createBooking } from "../../bookings/route";
import { GET as getAvailability } from "../../availability/route";
import { prisma } from "@/lib/prisma";
import { getTodayBangkok, buildDateWindow, toISODate } from "@/lib/booking/today";

const mockedGetServerSession = vi.mocked(getServerSession);
const dates = buildDateWindow(getTodayBangkok());
const validDateISO = toISODate(dates[1]);

async function seedBooking() {
  const res = await createBooking(
    new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: "cut",
        date: validDateISO,
        time: "12:00",
        name: "ลูกค้า",
        phone: "0898765432",
        note: "",
      }),
    }),
  );
  return res.json() as Promise<{ bookingCode: string }>;
}

beforeEach(async () => {
  await prisma.booking.deleteMany();
  mockedGetServerSession.mockReset();
});

afterAll(async () => {
  await prisma.booking.deleteMany();
  await prisma.$disconnect();
});

describe("GET /api/admin/bookings", () => {
  it("rejects unauthenticated requests", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const res = await listBookings(new NextRequest("http://localhost/api/admin/bookings"));
    expect(res.status).toBe(401);
  });

  it("lists bookings for an authenticated admin", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "admin@example.com" } } as never);
    await seedBooking();

    const res = await listBookings(new NextRequest("http://localhost/api/admin/bookings"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].status).toBe("CONFIRMED");
    expect(data[0].serviceName).toBe("ตัดผม");
  });
});

describe("PATCH /api/admin/bookings/:id", () => {
  it("rejects unauthenticated requests", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const res = await cancelBooking(
      new NextRequest("http://localhost/api/admin/bookings/x", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      }),
      { params: Promise.resolve({ id: "irrelevant-since-auth-checked-first" }) },
    );
    expect(res.status).toBe(401);
  });

  it("404s for a booking that doesn't exist", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "admin@example.com" } } as never);
    const res = await cancelBooking(
      new NextRequest("http://localhost/api/admin/bookings/missing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    expect(res.status).toBe(404);
  });

  it("cancels a booking and frees its slot for new bookings", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "admin@example.com" } } as never);
    await seedBooking();
    const [row] = await prisma.booking.findMany();

    const res = await cancelBooking(
      new NextRequest(`http://localhost/api/admin/bookings/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      }),
      { params: Promise.resolve({ id: row.id }) },
    );
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("CANCELLED");

    const availabilityRes = await getAvailability(
      new NextRequest(`http://localhost/api/availability?date=${validDateISO}&serviceId=cut`),
    );
    const slots: { time: string; available: boolean }[] = (await availabilityRes.json()).slots;
    expect(slots.find((s) => s.time === "12:00")?.available).toBe(true);
  });

  it("cancelling an already-cancelled booking is idempotent", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "admin@example.com" } } as never);
    await seedBooking();
    const [row] = await prisma.booking.findMany();
    const patchReq = () =>
      new NextRequest(`http://localhost/api/admin/bookings/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

    const first = await cancelBooking(patchReq(), { params: Promise.resolve({ id: row.id }) });
    const second = await cancelBooking(patchReq(), { params: Promise.resolve({ id: row.id }) });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });
});
