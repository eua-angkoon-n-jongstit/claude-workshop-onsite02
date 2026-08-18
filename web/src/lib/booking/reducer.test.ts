import { describe, expect, it } from "vitest";
import { bookingReducer, initialBookingState } from "./reducer";

describe("bookingReducer", () => {
  it("SELECT_DATE clears a previously picked time", () => {
    const withTime = bookingReducer(initialBookingState, { type: "SELECT_TIME", time: "10:00" });
    const result = bookingReducer(withTime, { type: "SELECT_DATE", dateIndex: 2 });
    expect(result.dateIndex).toBe(2);
    expect(result.time).toBeNull();
  });

  it("CONFIRM_BOOKING sets step 4 and stores the booking code", () => {
    const result = bookingReducer(initialBookingState, {
      type: "CONFIRM_BOOKING",
      bookingCode: "BK1808-1234",
    });
    expect(result.step).toBe(4);
    expect(result.bookingCode).toBe("BK1808-1234");
  });

  it("RESET returns to the initial state", () => {
    const modified = bookingReducer(initialBookingState, { type: "SET_NAME", name: "สมชาย" });
    const result = bookingReducer(modified, { type: "RESET" });
    expect(result).toEqual(initialBookingState);
  });
});
