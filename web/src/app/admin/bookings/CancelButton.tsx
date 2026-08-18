"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleCancel() {
    if (!confirm("ยกเลิกคิวนี้?")) return;
    setPending(true);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={pending}
      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
    >
      {pending ? "กำลังยกเลิก..." : "ยกเลิก"}
    </button>
  );
}
