export function validatePhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone);
}
