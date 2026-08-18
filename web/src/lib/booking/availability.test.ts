import { describe, expect, it } from "vitest";
import { computeAvailability, slotCountForService } from "./availability";
import { TIME_SLOTS } from "./mockData";
import type { Service } from "./types";

const shortService: Service = { id: "cut", name: "ตัดผม", duration: 30, price: 300, icon: "✂️" };
const longService: Service = { id: "perm", name: "ดัดผม", duration: 90, price: 900, icon: "🌀" };

describe("slotCountForService", () => {
  it("rounds up to the nearest 30-minute slot", () => {
    expect(slotCountForService(shortService)).toBe(1);
    expect(slotCountForService(longService)).toBe(3);
    expect(slotCountForService({ ...shortService, duration: 45 })).toBe(2);
  });
});

describe("computeAvailability", () => {
  it("marks every slot available when there are no existing bookings", () => {
    const result = computeAvailability([], 1);
    expect(result.every(Boolean)).toBe(true);
    expect(result.length).toBe(TIME_SLOTS.length);
  });

  it("marks a slot inside an existing booking's range as unavailable", () => {
    const result = computeAvailability([{ startSlotIndex: 5, slotCount: 3 }], 1);
    expect(result[4]).toBe(true);
    expect(result[5]).toBe(false);
    expect(result[6]).toBe(false);
    expect(result[7]).toBe(false);
    expect(result[8]).toBe(true);
  });

  it("marks a start time unavailable if its required span overflows the grid, even with zero bookings", () => {
    const result = computeAvailability([], 3);
    const lastValidStart = TIME_SLOTS.length - 3;
    expect(result[lastValidStart]).toBe(true);
    expect(result[lastValidStart + 1]).toBe(false);
    expect(result[TIME_SLOTS.length - 1]).toBe(false);
  });

  it("does not falsely block adjacent, non-overlapping bookings", () => {
    // a booking occupying slots 5-6 should not block a new 1-slot booking starting at 7
    const result = computeAvailability([{ startSlotIndex: 5, slotCount: 2 }], 1);
    expect(result[7]).toBe(true);
  });

  it("a multi-slot request overlapping the tail of an existing booking is blocked", () => {
    // existing booking occupies slots 5-6; a 2-slot request starting at 6 overlaps at slot 6
    const result = computeAvailability([{ startSlotIndex: 5, slotCount: 2 }], 2);
    expect(result[6]).toBe(false);
    expect(result[7]).toBe(true);
  });
});
