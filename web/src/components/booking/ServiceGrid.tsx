import type { Service } from "@/lib/booking/types";

export default function ServiceGrid({
  services,
  selected,
  onSelect,
}: {
  services: Service[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {services.map((svc) => {
        const isSelected = selected === svc.id;
        return (
          <button
            key={svc.id}
            type="button"
            onClick={() => onSelect(svc.id)}
            className={`text-left p-3 rounded-xl border-2 transition-colors ${
              isSelected
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            }`}
          >
            <div className="text-2xl mb-1">{svc.icon}</div>
            <div className="font-semibold text-sm">{svc.name}</div>
            <div className="text-xs text-zinc-400 mt-0.5">{svc.duration} นาที</div>
            <div
              className={`text-xs font-semibold ${isSelected ? "text-amber-400" : "text-zinc-300"} mt-1`}
            >
              {svc.price} บาท
            </div>
          </button>
        );
      })}
    </div>
  );
}
