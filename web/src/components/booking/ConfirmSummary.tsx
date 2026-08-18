import type { Service } from "@/lib/booking/types";
import { formatThaiDate } from "@/lib/booking/format";

export default function ConfirmSummary({
  service,
  dateIndex,
  time,
  name,
  phone,
  onBack,
  onConfirm,
}: {
  service: Service;
  dateIndex: number;
  time: string;
  name: string;
  phone: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">ยืนยันการจอง</h2>
        <p className="text-zinc-500 text-sm mb-4">ตรวจสอบรายละเอียดก่อนยืนยัน</p>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl divide-y divide-zinc-700/70 overflow-hidden">
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">บริการ</span>
          <span className="font-medium text-right">{service.name}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">วันที่</span>
          <span className="font-medium text-right">{formatThaiDate(dateIndex)}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">เวลา</span>
          <span className="font-medium text-right">{time} น.</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">ระยะเวลา</span>
          <span className="font-medium text-right">{service.duration} นาที</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">ราคา</span>
          <span className="font-medium text-right text-amber-400">{service.price} บาท</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">ชื่อ</span>
          <span className="font-medium text-right">{name}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-zinc-400 text-sm">เบอร์โทร</span>
          <span className="font-medium text-right">{phone}</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-semibold hover:bg-zinc-700 transition-colors"
        >
          ← แก้ไขข้อมูล
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          ยืนยันการจอง
        </button>
      </div>
    </section>
  );
}
