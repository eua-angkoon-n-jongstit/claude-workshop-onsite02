import { describe, expect, it } from "vitest";
import { generateBookingCode } from "./bookingCode";

describe("generateBookingCode", () => {
  it("matches the BK\\d{4}-\\d{4} format", () => {
    const code = generateBookingCode(new Date(2026, 7, 18));
    expect(code).toMatch(/^BK\d{4}-\d{4}$/);
  });

  it("the last 4 digits vary across calls", () => {
    const codes = new Set(
      Array.from({ length: 20 }, () => generateBookingCode(new Date(2026, 7, 18))),
    );
    expect(codes.size).toBeGreaterThan(1);
  });
});
