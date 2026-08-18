import type { Service } from "./types";

export const SERVICES: Service[] = [
  { id: "cut", name: "ตัดผม", duration: 30, price: 300, icon: "✂️" },
  { id: "cutwash", name: "สระ + ตัด", duration: 45, price: 450, icon: "💇" },
  { id: "shave", name: "โกนหนวด", duration: 20, price: 200, icon: "🪒" },
  { id: "color", name: "ทำสีผม", duration: 60, price: 800, icon: "🎨" },
  { id: "perm", name: "ดัดผม", duration: 90, price: 900, icon: "🌀" },
  { id: "kids", name: "ตัดผมเด็ก", duration: 25, price: 250, icon: "🧒" },
];

export const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
export const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

// fixed "today" so the mock data is deterministic
export const TODAY = new Date(2026, 7, 18); // 18 Aug 2026

function buildDates(count: number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export const DATES = buildDates(14);

// deterministic mock "booked" slots per date so each day looks a little different
export function isSlotBooked(dateIndex: number, slotIndex: number): boolean {
  return (dateIndex * 3 + slotIndex * 7) % 5 === 0;
}

export const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 19; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 19) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}
