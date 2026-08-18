<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project

Next.js (App Router, TypeScript, Tailwind v4) port of the barbershop booking wizard originally prototyped at `../prototype/index.html` — see the root `CLAUDE.md` for the prototype's own conventions and the full migration plan context. This app is being built in phases: (1) UI port with in-memory mock data — done — (2) API routes, (3) Prisma/Postgres persistence, (4) NextAuth admin + deploy.

## Architecture

- `src/lib/booking/` — pure, framework-free logic ported from the prototype 1:1: `mockData.ts` (`SERVICES`, `DATES`, `TIME_SLOTS`, `isSlotBooked`), `validation.ts` (`validatePhone`), `format.ts` (`formatThaiDate`, Buddhist-era +543), `bookingCode.ts` (`generateBookingCode`), `reducer.ts` (`bookingReducer` — the single source of truth for the in-progress booking, replacing the prototype's mutable `state` object).
- `src/components/booking/` — one component per prototype render function (`ServiceGrid`, `DateScroll`, `TimeSlotGrid`, `ContactForm`, `ConfirmSummary`, `SuccessScreen`, `Stepper`), composed by `BookingWizard.tsx` (`'use client'`, owns the `useReducer` wizard state).
- `src/app/(customer)/` — the customer-facing route group (header/footer shell in `layout.tsx`, wizard entry in `page.tsx`). An `(admin)/` route group is added in Phase 2 for shop-staff management (bookings/services/slots) — keep customer and admin visually and structurally separate under their own route groups rather than mixing them into one layout.
- `TIME_SLOTS`/`isSlotBooked` are still the prototype's fake deterministic data as of Phase 1 — `TimeSlotGrid` takes `isBooked` as a prop specifically so Phase 2/3 can swap in a real availability query without touching the component.

## Conventions

- Match the prototype's validation/reset semantics exactly, not just its look: an error only *clears* once a field becomes valid (never proactively shown while typing an untouched/intermediate-invalid value) — see `ContactForm.tsx`'s `nameErrorVisible`/`phoneErrorVisible` local state.
- `TODAY` in `mockData.ts` stays a hardcoded constant (`new Date(2026, 7, 18)`) for parity with the prototype. If this ever needs to become the real current date, compute it server-side and pass it down as a prop — don't call `new Date()` inside client-rendered code, to avoid hydration mismatches.
- Verify any change against the manual checklist in the root `CLAUDE.md` (date/time gating, phone validation edge cases, Buddhist-era date, booking code format, stepper hidden on success, full reset) — there's no automated test suite yet.
