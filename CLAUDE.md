# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-file static HTML page (`index.html`) implementing a Thai-language barbershop booking flow (ระบบจองคิวร้านตัดผม). Styled with the Tailwind CDN build and Google's Prompt font. There is no backend, build step, package manager, or test suite — all data is mocked in-page and all logic is vanilla JS embedded in a `<script>` tag at the bottom of the file.

## Running / Testing

There is no build or dev server. Open `index.html` directly in a browser to run it:

```powershell
Start-Process "index.html"
```

Any change is verified by reloading the file in the browser and clicking through the flow manually — there is no automated test runner in this repo.

## Architecture

Everything lives in `index.html`, in three parts:

1. **Mock data** (top of the `<script>` block): `SERVICES` (service name/duration/price), `DATES` (14 days generated from a fixed `TODAY` constant so the page is deterministic), `TIME_SLOTS` (09:00–19:00 in 30-min increments), and `isSlotBooked(dateIndex, slotIndex)`, a deterministic formula that fakes some slots as already booked. There is no fetch/API call anywhere — do not add one unless explicitly asked, since "no backend" is a deliberate constraint of this project.

2. **Single mutable `state` object** (`service`, `dateIndex`, `time`, `name`, `phone`, `note`) is the only source of truth for the booking in progress. All render functions read from `state` and re-render on every mutation — there is no diffing/virtual DOM, so render functions rebuild their target element's `innerHTML` from scratch each call (`renderServices`, `renderDates`, `renderTimeSlots`, `renderStepper`, `renderSummary`).

3. **Step navigation**: the page is a 4-step wizard (service+date+time → contact info → confirm → success) implemented as four `<section id="step-N">` elements toggled via `goToStep(n)`, which shows/hides sections with the `hidden` class and re-renders the 3-dot stepper (steps 1–3 only; the success screen hides the stepper). `resetAll()` clears `state` and DOM inputs and returns to step 1 for booking another slot.

When extending this page (e.g. adding a service, changing validation, adjusting the date range), keep the mock-data/state/render separation above rather than introducing a framework or build tooling.
