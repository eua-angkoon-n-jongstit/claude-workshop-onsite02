import { DATES, THAI_DAYS, THAI_MONTHS } from "./mockData";

// converts Gregorian year to Buddhist Era (+543)
export function formatThaiDateValue(d: Date): string {
  return `วัน${THAI_DAYS[d.getDay()].replace(".", "")}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function formatThaiDate(dateIndex: number): string {
  return formatThaiDateValue(DATES[dateIndex]);
}
