import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SERVICES, TIME_SLOTS } from "@/lib/booking/mockData";
import { formatThaiDateValue } from "@/lib/booking/format";
import CancelButton from "./CancelButton";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const bookings = await prisma.booking.findMany({
    orderBy: [{ date: "asc" }, { startSlotIndex: "asc" }],
  });
  const serviceById = new Map(SERVICES.map((s) => [s.id, s]));

  if (bookings.length === 0) {
    return <p className="text-zinc-500">ยังไม่มีการจอง</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
            b.status === "CANCELLED"
              ? "border-zinc-800 bg-zinc-900/40 opacity-50"
              : "border-zinc-800 bg-zinc-900/70"
          }`}
        >
          <div>
            <p className="font-semibold">
              {serviceById.get(b.serviceId)?.name ?? b.serviceId} — {b.name}
            </p>
            <p className="text-sm text-zinc-400">
              {formatThaiDateValue(b.date)} · {TIME_SLOTS[b.startSlotIndex]} · {b.phone}
            </p>
            <p className="text-xs text-zinc-600 mt-1">{b.bookingCode}</p>
            {b.note && <p className="text-xs text-zinc-500 mt-1">{b.note}</p>}
          </div>
          {b.status === "CONFIRMED" ? (
            <CancelButton bookingId={b.id} />
          ) : (
            <span className="text-xs text-zinc-600">ยกเลิกแล้ว</span>
          )}
        </div>
      ))}
    </div>
  );
}
