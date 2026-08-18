export default function TimeSlotGrid({
  slots,
  dateIndex,
  selected,
  availability,
  onSelect,
}: {
  slots: string[];
  dateIndex: number | null;
  selected: string | null;
  availability: boolean[] | null;
  onSelect: (time: string) => void;
}) {
  const hint =
    dateIndex === null
      ? "กรุณาเลือกวันที่ก่อน"
      : availability === null
        ? "กำลังโหลดช่วงเวลาที่ว่าง..."
        : "ช่วงเวลาที่ว่างสำหรับวันที่เลือก";

  return (
    <>
      <p className="text-zinc-500 text-sm mb-4">{hint}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {dateIndex !== null &&
          availability !== null &&
          slots.map((slot, idx) => {
            const booked = !availability[idx];
            const isSelected = selected === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={booked}
                onClick={() => onSelect(slot)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  booked
                    ? "border-zinc-800 bg-zinc-900 text-zinc-700 line-through cursor-not-allowed"
                    : isSelected
                      ? "border-amber-500 bg-amber-500 text-zinc-950"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 text-zinc-200"
                }`}
              >
                {slot}
              </button>
            );
          })}
      </div>
    </>
  );
}
