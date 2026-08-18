import type { Service } from "./types";
import { TIME_SLOTS } from "./mockData";

export function slotCountForService(service: Service): number {
  return Math.ceil(service.duration / 30);
}

export type BookingRange = {
  startSlotIndex: number;
  slotCount: number;
};

// One boolean per TIME_SLOTS entry: whether a booking of `slotCount` slots
// could start at that index without overflowing the grid (decision #5) or
// overlapping any range in `existingRanges` (decision #1/#2).
export function computeAvailability(
  existingRanges: BookingRange[],
  slotCount: number,
): boolean[] {
  return TIME_SLOTS.map((_, startIndex) => {
    if (startIndex + slotCount > TIME_SLOTS.length) return false;
    return !existingRanges.some(
      (r) =>
        startIndex < r.startSlotIndex + r.slotCount &&
        r.startSlotIndex < startIndex + slotCount,
    );
  });
}
