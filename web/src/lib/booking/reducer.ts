import type { BookingState, WizardStep } from "./types";

export const initialBookingState: BookingState = {
  step: 1,
  service: null,
  dateIndex: null,
  time: null,
  name: "",
  phone: "",
  note: "",
  bookingCode: null,
};

export type BookingAction =
  | { type: "SELECT_SERVICE"; service: string }
  | { type: "SELECT_DATE"; dateIndex: number }
  | { type: "SELECT_TIME"; time: string }
  | { type: "SET_NAME"; name: string }
  | { type: "SET_PHONE"; phone: string }
  | { type: "SET_NOTE"; note: string }
  | { type: "GO_TO_STEP"; step: WizardStep }
  | { type: "CONFIRM_BOOKING"; bookingCode: string }
  | { type: "RESET" };

export function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "SELECT_SERVICE":
      return { ...state, service: action.service };
    case "SELECT_DATE":
      // switching dates clears a previously picked time
      return { ...state, dateIndex: action.dateIndex, time: null };
    case "SELECT_TIME":
      return { ...state, time: action.time };
    case "SET_NAME":
      return { ...state, name: action.name };
    case "SET_PHONE":
      return { ...state, phone: action.phone };
    case "SET_NOTE":
      return { ...state, note: action.note };
    case "GO_TO_STEP":
      return { ...state, step: action.step };
    case "CONFIRM_BOOKING":
      return { ...state, bookingCode: action.bookingCode, step: 4 };
    case "RESET":
      return initialBookingState;
    default:
      return state;
  }
}
