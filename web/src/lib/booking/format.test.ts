import { describe, expect, it } from "vitest";
import { formatThaiDateValue } from "./format";

describe("formatThaiDateValue", () => {
  it("converts the Gregorian year to Buddhist Era (+543)", () => {
    const result = formatThaiDateValue(new Date(2026, 7, 18)); // 18 Aug 2026
    expect(result).toContain("2569");
  });

  it("converts correctly across a year boundary", () => {
    const result = formatThaiDateValue(new Date(2025, 11, 31)); // 31 Dec 2025
    expect(result).toContain("2568");
  });
});
