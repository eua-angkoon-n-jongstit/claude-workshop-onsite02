"use client";

import { useEffect, useRef, useState, useReducer } from "react";
import { SERVICES, TIME_SLOTS } from "@/lib/booking/mockData";
import { bookingReducer, initialBookingState } from "@/lib/booking/reducer";
import { toISODate } from "@/lib/booking/today";
import Stepper from "./Stepper";
import ServiceGrid from "./ServiceGrid";
import DateScroll from "./DateScroll";
import TimeSlotGrid from "./TimeSlotGrid";
import ContactForm from "./ContactForm";
import ConfirmSummary from "./ConfirmSummary";
import SuccessScreen from "./SuccessScreen";

export default function BookingWizard({ dates }: { dates: Date[] }) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  const [availability, setAvailability] = useState<boolean[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestId = useRef(0);
  // key of the service+date the current `availability` state was fetched for;
  // compared against the live selection below so a fetch-in-flight (or no
  // selection) renders as "loading" without an extra setState in the effect body
  const [availabilityKey, setAvailabilityKey] = useState<string | null>(null);

  const canProceedStep1 = Boolean(
    state.service && state.dateIndex !== null && state.time,
  );

  const selectionKey =
    state.service && state.dateIndex !== null ? `${state.service}:${state.dateIndex}` : null;

  useEffect(() => {
    if (!state.service || state.dateIndex === null) return;
    const thisRequest = ++requestId.current;
    const key = `${state.service}:${state.dateIndex}`;
    const dateISO = toISODate(dates[state.dateIndex]);
    fetch(`/api/availability?date=${dateISO}&serviceId=${state.service}`)
      .then((res) => res.json())
      .then((data: { slots: { time: string; available: boolean }[] }) => {
        if (thisRequest !== requestId.current) return; // stale response
        setAvailabilityKey(key);
        setAvailability(data.slots.map((s) => s.available));
      })
      .catch(() => {
        if (thisRequest !== requestId.current) return;
        setAvailabilityKey(key);
        setAvailability(TIME_SLOTS.map(() => false));
      });
  }, [state.service, state.dateIndex, dates]);

  const effectiveAvailability = availabilityKey === selectionKey ? availability : null;

  async function handleConfirm() {
    if (state.dateIndex === null || !state.time || !state.service) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: state.service,
          date: toISODate(dates[state.dateIndex]),
          time: state.time,
          name: state.name,
          phone: state.phone,
          note: state.note,
        }),
      });

      if (res.status === 201) {
        const data = await res.json();
        dispatch({ type: "CONFIRM_BOOKING", bookingCode: data.bookingCode });
        return;
      }

      if (res.status === 409) {
        setSubmitError("ช่วงเวลานี้เพิ่งถูกจองไปแล้ว กรุณาเลือกเวลาอื่น");
        dispatch({ type: "SELECT_DATE", dateIndex: state.dateIndex }); // re-selecting the same date clears the stale time
        dispatch({ type: "GO_TO_STEP", step: 1 });
        // re-trigger availability fetch for the current date/service
        const thisRequest = ++requestId.current;
        const key = `${state.service}:${state.dateIndex}`;
        const dateISO = toISODate(dates[state.dateIndex]);
        fetch(`/api/availability?date=${dateISO}&serviceId=${state.service}`)
          .then((r) => r.json())
          .then((data: { slots: { time: string; available: boolean }[] }) => {
            if (thisRequest !== requestId.current) return;
            setAvailabilityKey(key);
            setAvailability(data.slots.map((s) => s.available));
          });
        return;
      }

      setSubmitError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } catch {
      setSubmitError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
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
                dates={dates}
                selectedIndex={state.dateIndex}
                onSelect={(dateIndex) => dispatch({ type: "SELECT_DATE", dateIndex })}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">เลือกเวลา</h2>
              {submitError && (
                <p className="text-red-400 text-sm mb-3">{submitError}</p>
              )}
              <TimeSlotGrid
                slots={TIME_SLOTS}
                dateIndex={state.dateIndex}
                selected={state.time}
                availability={effectiveAvailability}
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
            date={dates[state.dateIndex]}
            time={state.time}
            name={state.name}
            phone={state.phone}
            onBack={() => dispatch({ type: "GO_TO_STEP", step: 2 })}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
          />
        )}

        {state.step === 4 &&
          state.service &&
          state.dateIndex !== null &&
          state.time &&
          state.bookingCode && (
            <SuccessScreen
              service={SERVICES.find((s) => s.id === state.service)!}
              date={dates[state.dateIndex]}
              time={state.time}
              bookingCode={state.bookingCode}
              onNewBooking={() => {
                setSubmitError(null);
                dispatch({ type: "RESET" });
              }}
            />
          )}
      </main>
    </>
  );
}
