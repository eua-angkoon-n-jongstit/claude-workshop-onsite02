import { DATES } from "./mockData";

export function generateBookingCode(dateIndex: number): string {
  const d = DATES[dateIndex];
  const datePart = `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `BK${datePart}-${randPart}`;
}
