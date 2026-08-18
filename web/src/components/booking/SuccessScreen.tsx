import type { Service } from "@/lib/booking/types";
import { formatThaiDate } from "@/lib/booking/format";

export default function SuccessScreen({
  service,
  dateIndex,
  time,
  bookingCode,
  onNewBooking,
}: {
  service: Service;
  dateIndex: number;
  time: string;
  bookingCode: string;
  onNewBooking: () => void;
}) {
  return (
    <section className="text-center py-6 space-y-5">
      <div className="pop-in inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-emerald-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2 className="text-2xl font-bold fade-up">จองคิวสำเร็จ!</h2>
      <p className="text-zinc-400 fade-up">เราได้บันทึกการจองของคุณเรียบร้อยแล้ว</p>
      <div className="fade-up inline-block bg-zinc-800/70 border border-zinc-700 rounded-xl px-5 py-3">
        <p className="text-xs text-zinc-500 mb-0.5">เลขที่การจอง</p>
        <p className="text-xl font-bold text-amber-400 tracking-wider">{bookingCode}</p>
      </div>
      <div className="fade-up bg-zinc-800/50 border border-zinc-700 rounded-2xl divide-y divide-zinc-700/70 overflow-hidden text-left max-w-sm mx-auto">
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">บริการ</span>
          <span className="font-medium text-right">{service.name}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">วันเวลา</span>
          <span className="font-medium text-right">
            {formatThaiDate(dateIndex)} เวลา {time} น.
          </span>
        </div>
      </div>
      <div className="pt-3">
        <button
          type="button"
          onClick={onNewBooking}
          className="px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          จองคิวใหม่
        </button>
      </div>
    </section>
  );
}
