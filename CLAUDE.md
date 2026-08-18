# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This repo has two parts:

- **`web/`** — the active Next.js application (TypeScript, App Router, Tailwind, Prisma/Postgres, NextAuth once those phases land). This is where new feature work happens. See `web/CLAUDE.md` / `web/AGENTS.md` for its conventions.
- **`prototype/index.html`** — the original single-file static HTML prototype this app was built from. Kept as a visual/behavioral reference only; do not add features here. See below for its own conventions, preserved as-is.

## `prototype/index.html`

A single-file static HTML page implementing a Thai-language barbershop booking flow (ระบบจองคิวร้านตัดผม). Styled with the Tailwind CDN build and Google's Prompt font. There is no backend, build step, package manager, or test suite — all data is mocked in-page and all logic is vanilla JS embedded in a `<script>` tag at the bottom of the file.

### Running / Testing

There is no build or dev server. Open `prototype/index.html` directly in a browser to run it:

```powershell
Start-Process "prototype/index.html"
```

Any change is verified by reloading the file in the browser and clicking through the flow manually — there is no automated test runner in this repo. Walk this checklist after any change to `prototype/index.html` (the same checklist is used to verify parity in `web/`):

- **Step 1 (service/date/time)**: pick a service, pick a date, pick a time. Switching dates must clear a previously picked time (time-slot grid resets and shows the "pick a date first" hint until re-selected). A slot flagged booked by `isSlotBooked` must be unclickable/struck through. The "next" button must stay disabled until service + date + time are all set — check partial combinations, not just the complete one. The first date chip (index 0) must always read "วันนี้".
- **Step 2 (contact info)**: empty or whitespace-only name must block navigation with an error. Phone must enforce `validatePhone` (`^0\d{9}$`) — try 9 digits, 11+ digits (must truncate to 10 as you type), digits not starting with `0`, and pasted non-digit characters (must be stripped live). An error must only clear once its field is actually valid, never while typing an intermediate invalid value.
- **Step 3 (confirm)**: the Thai date must convert the year to Buddhist Era (+543) correctly. Going back to step 2 must preserve the name/phone/note already entered.
- **Step 4 (success)**: the booking code must match `BK\d{4}-\d{4}`, with the last 4 digits changing on each run (it's the one random value in the file). The stepper must be hidden on this screen.
- **New booking (`resetAll`)**: after finishing a booking, starting a new one must show no service/date selected and the "pick a date first" hint for time slots, and step 2's inputs must be empty.

### Coding Style

`prototype/index.html` already follows a consistent style — match it rather than introducing a different one:

- 2-space indentation, semicolons always, single quotes for plain string literals, backticks only when interpolating a value or building a multi-line HTML string.
- `const` by default; `let` only for values that are genuinely reassigned (e.g. a loop counter). Never `var`.
- Top-level functions use the `function` keyword (`function renderX() {...}`). Arrow functions are reserved for callbacks: event listeners, `.forEach`, `.find`.
- `camelCase` for variables/functions, `SCREAMING_SNAKE_CASE` for module-level constant data (`SERVICES`, `DATES`, etc.). Name booleans so they read as a statement (`isActive`, `booked`, `valid`).
- DOM access is `document.getElementById` only (no `querySelector`), called fresh at the point of use rather than cached — that's the existing pattern, not an oversight to fix in passing.
- HTML ids are kebab-case following a `{prefix}-{field}` pattern (`err-phone`, `sum-service`, `done-datetime`).
- Order Tailwind utility classes: layout/display → sizing → spacing → shape/border → color → state variants (`hover:`, `focus:`, `disabled:`) → transition/animation last.
- Comments are rare: a `// ---------- Label ----------` banner marks each logical section (mock data, state, stepper, per-step rendering, validation, navigation, wiring, init); inline comments only explain a non-obvious *why*, never restate *what* the code does. No JSDoc.
- User-facing copy (labels, placeholders, errors) is always Thai; identifiers and comments are always English.

### Architecture

Everything lives in `prototype/index.html`, in three parts:

1. **Mock data** (top of the `<script>` block): `SERVICES` (service name/duration/price), `DATES` (14 days generated from a fixed `TODAY` constant so the page is deterministic), `TIME_SLOTS` (09:00–19:00 in 30-min increments), and `isSlotBooked(dateIndex, slotIndex)`, a deterministic formula that fakes some slots as already booked. There is no fetch/API call anywhere — this file is frozen as a reference and should not be extended; new work happens in `web/`.

2. **Single mutable `state` object** (`service`, `dateIndex`, `time`, `name`, `phone`, `note`) is the only source of truth for the booking in progress. All render functions read from `state` and re-render on every mutation — there is no diffing/virtual DOM, so render functions rebuild their target element's `innerHTML` from scratch each call (`renderServices`, `renderDates`, `renderTimeSlots`, `renderStepper`, `renderSummary`).

3. **Step navigation**: the page is a 4-step wizard (service+date+time → contact info → confirm → success) implemented as four `<section id="step-N">` elements toggled via `goToStep(n)`, which shows/hides sections with the `hidden` class and re-renders the 3-dot stepper (steps 1–3 only; the success screen hides the stepper). `resetAll()` clears `state` and DOM inputs and returns to step 1 for booking another slot.
