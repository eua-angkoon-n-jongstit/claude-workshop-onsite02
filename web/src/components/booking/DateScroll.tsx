import { THAI_DAYS, THAI_MONTHS } from "@/lib/booking/mockData";

export default function DateScroll({
  dates,
  selectedIndex,
  onSelect,
}: {
  dates: Date[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {dates.map((d, idx) => {
        const isSelected = selectedIndex === idx;
        const isToday = idx === 0;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(idx)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-colors ${
              isSelected
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            }`}
          >
            <span className={`text-[11px] ${isSelected ? "text-amber-400" : "text-zinc-400"}`}>
              {isToday ? "วันนี้" : THAI_DAYS[d.getDay()]}
            </span>
            <span className={`text-lg font-bold mt-0.5 ${isSelected ? "text-amber-400" : "text-zinc-100"}`}>
              {d.getDate()}
            </span>
            <span className={`text-[11px] ${isSelected ? "text-amber-400" : "text-zinc-500"}`}>
              {THAI_MONTHS[d.getMonth()]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
