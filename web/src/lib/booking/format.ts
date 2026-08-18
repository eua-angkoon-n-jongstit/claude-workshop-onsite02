import { DATES, THAI_DAYS, THAI_MONTHS } from "./mockData";

// converts Gregorian year to Buddhist Era (+543)
export function formatThaiDate(dateIndex: number): string {
  const d = DATES[dateIndex];
  return `วัน${THAI_DAYS[d.getDay()].replace(".", "")}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}
