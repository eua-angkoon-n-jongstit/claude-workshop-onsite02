export function generateBookingCode(date: Date): string {
  const datePart = `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `BK${datePart}-${randPart}`;
}
