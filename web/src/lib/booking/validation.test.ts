import { describe, expect, it } from "vitest";
import { validatePhone } from "./validation";

describe("validatePhone", () => {
  it("accepts a valid 10-digit phone starting with 0", () => {
    expect(validatePhone("0812345678")).toBe(true);
  });

  it("rejects 9 digits", () => {
    expect(validatePhone("081234567")).toBe(false);
  });

  it("rejects 11+ digits", () => {
    expect(validatePhone("08123456789")).toBe(false);
  });

  it("rejects a phone not starting with 0", () => {
    expect(validatePhone("1812345678")).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(validatePhone("081-234-567")).toBe(false);
  });
});
