"use client";

import { useReducer } from "react";
import { SERVICES, DATES, TIME_SLOTS, isSlotBooked } from "@/lib/booking/mockData";
import { generateBookingCode } from "@/lib/booking/bookingCode";
import { bookingReducer, initialBookingState } from "@/lib/booking/reducer";
import Stepper from "./Stepper";
import ServiceGrid from "./ServiceGrid";
import DateScroll from "./DateScroll";
import TimeSlotGrid from "./TimeSlotGrid";
import ContactForm from "./ContactForm";
import ConfirmSummary from "./ConfirmSummary";
import SuccessScreen from "./SuccessScreen";

export default function BookingWizard() {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);

  const canProceedStep1 = Boolean(
    state.service && state.dateIndex !== null && state.time,
  );

  function handleConfirm() {
    if (state.dateIndex === null || !state.time || !state.service) return;
    dispatch({
      type: "CONFIRM_BOOKING",
      bookingCode: generateBookingCode(state.dateIndex),
    });
  }

  return (
    <>
      {(state.step === 1 || state.step === 2 || state.step === 3) && (
        <Stepper current={state.step} />
      )}

      <main className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/40 backdrop-blur">
        {state.step === 1 && (
          <section className="space-y-7">
            <div>
              <h2 className="text-lg font-semibold mb-1">เลือกบริการ</h2>
              <p className="text-zinc-500 text-sm mb-4">เลือกบริการที่ต้องการ</p>
              <ServiceGrid
                services={SERVICES}
                selected={state.service}
                onSelect={(service) => dispatch({ type: "SELECT_SERVICE", service })}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">เลือกวันที่</h2>
              <p className="text-zinc-500 text-sm mb-4">เลื่อนเพื่อดูวันที่ถัดไป</p>
              <DateScroll
                dates={DATES}
                selectedIndex={state.dateIndex}
                onSelect={(dateIndex) => dispatch({ type: "SELECT_DATE", dateIndex })}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">เลือกเวลา</h2>
              <TimeSlotGrid
                slots={TIME_SLOTS}
                dateIndex={state.dateIndex}
                selected={state.time}
                isBooked={isSlotBooked}
                onSelect={(time) => dispatch({ type: "SELECT_TIME", time })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => dispatch({ type: "GO_TO_STEP", step: 2 })}
                className="px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 font-semibold disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors hover:bg-amber-400 disabled:hover:bg-zinc-800"
              >
                ถัดไป →
              </button>
            </div>
          </section>
        )}

        {state.step === 2 && (
          <ContactForm
            name={state.name}
            phone={state.phone}
            note={state.note}
            onNameChange={(name) => dispatch({ type: "SET_NAME", name })}
            onPhoneChange={(phone) => dispatch({ type: "SET_PHONE", phone })}
            onNoteChange={(note) => dispatch({ type: "SET_NOTE", note })}
            onBack={() => dispatch({ type: "GO_TO_STEP", step: 1 })}
            onNext={() => dispatch({ type: "GO_TO_STEP", step: 3 })}
          />
        )}

        {state.step === 3 && state.service && state.dateIndex !== null && state.time && (
          <ConfirmSummary
            service={SERVICES.find((s) => s.id === state.service)!}
            dateIndex={state.dateIndex}
            time={state.time}
            name={state.name}
            phone={state.phone}
            onBack={() => dispatch({ type: "GO_TO_STEP", step: 2 })}
            onConfirm={handleConfirm}
          />
        )}

        {state.step === 4 &&
          state.service &&
          state.dateIndex !== null &&
          state.time &&
          state.bookingCode && (
            <SuccessScreen
              service={SERVICES.find((s) => s.id === state.service)!}
              dateIndex={state.dateIndex}
              time={state.time}
              bookingCode={state.bookingCode}
              onNewBooking={() => dispatch({ type: "RESET" })}
            />
          )}
      </main>
    </>
  );
}
