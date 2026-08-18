<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project

Next.js (App Router, TypeScript, Tailwind v4) port of the barbershop booking wizard originally prototyped at `../prototype/index.html` — see the root `CLAUDE.md` for the prototype's own conventions and the full migration plan context. Built in phases: (1) UI port with in-memory mock data, (2) API routes, (3) Prisma/Postgres persistence, (4) NextAuth admin + deploy — all four are done. Only actual Supabase project provisioning and the live Vercel deploy remain manual, credential-gated steps (see "Deploying" below).

## Architecture

- `src/lib/booking/` — pure, framework-free logic: `mockData.ts` (`SERVICES`, `TIME_SLOTS` — still static/hardcoded per decision to keep services out of the DB), `validation.ts` (`validatePhone`), `format.ts` (`formatThaiDateValue(date)` — the real entry point; `formatThaiDate(dateIndex)` is a thin wrapper kept only for the prototype's mock `DATES`), `bookingCode.ts` (`generateBookingCode(date)`), `reducer.ts` (`bookingReducer`), `today.ts` (`getTodayBangkok`, `buildDateWindow`, `toISODate`, `parseDateInWindow` — the real-clock replacement for `mockData.TODAY`), `availability.ts` (`computeAvailability`, `slotCountForService` — the single source of truth for slot-overlap math, shared by the availability route and the booking route's transaction so the two can never drift apart).
- `src/app/(customer)/page.tsx` is a **Server Component** with `export const dynamic = "force-dynamic"` — it must stay dynamic, since `getTodayBangkok()` needs to run per-request; Next.js will otherwise statically prerender the page once at build time and freeze "today" forever. `BookingWizard` receives the resulting `dates: Date[]` as a prop.
- `BookingWizard.tsx` fetches `GET /api/availability` client-side on every service/date change (see the `availabilityKey` state pattern used to avoid `react-hooks/set-state-in-effect` and `react-hooks/refs` lint errors — do not "simplify" this back to a ref-based cache-key, both are hard lint errors in this repo's eslint config) and POSTs to `/api/bookings` on confirm, handling `409 SLOT_UNAVAILABLE` by bouncing the user back to step 1 and re-fetching availability.
- `src/app/admin/` (a real path segment, not a route group — needed so `/admin/*` is an actual URL prefix for the proxy matcher) — `login/page.tsx` (client, `next-auth/react` `signIn`), `bookings/page.tsx` (server component, session-gated, queries Prisma directly), `CancelButton.tsx` (client, PATCHes `/api/admin/bookings/:id`).
- `src/proxy.ts` — Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (see "Next.js 16 gotchas" below); this wraps `next-auth/middleware`'s `withAuth` to gate `/admin/bookings/:path*`.
- `prisma/schema.prisma` — `Booking` (one row per confirmed/cancelled slot range: `date` + `startSlotIndex` + `slotCount`, no FK to a `Service` table since services aren't persisted) and `AdminUser` (single seeded admin, `prisma/seed.ts`).

## Prisma 7 gotchas (this repo pins `prisma`/`@prisma/client` ^7.9.1)

Prisma 7 is a materially different API from what most training data assumes:

- **A driver adapter is mandatory at runtime**, even with the classic `provider = "prisma-client-js"` generator — `new PrismaClient()` with no adapter throws immediately. `src/lib/prisma.ts` passes `new PrismaPg({ connectionString: process.env.DATABASE_URL })`. Don't remove this thinking it's legacy boilerplate.
- **`prisma.config.ts` (project root) replaces the schema's `datasource.url`** for CLI commands (`migrate`, `db seed`, etc.) — the schema's `datasource` block intentionally has no `url` line. `prisma.config.ts` points `datasource.url` at `DIRECT_URL` (non-pooled), while the app's runtime adapter uses `DATABASE_URL` (pooled) — these are deliberately different env vars for the same physical database, not a typo.
- `prisma/seed.ts` runs via `tsx` (configured in `prisma.config.ts`'s `migrations.seed`), not `ts-node`.
- Since there was no live Postgres available while building this, the initial migration (`prisma/migrations/20260818000000_init/`) was generated with `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` (works offline, no DB connection needed) rather than the usual `prisma migrate dev`. If you add more models before ever running `migrate dev` against a real database, regenerate this file the same way rather than hand-editing it.

## Next.js 16 gotchas (this repo pins `next` 16.3.1)

- **`middleware.ts` is renamed to `proxy.ts`**, exporting `proxy` (or a default export) instead of `middleware`. A file still named `middleware.ts` is silently ignored — no proxy runs, `/admin/bookings` becomes unprotected. `next-auth@4`'s `withAuth` still works, but must be **called** (`export default withAuth({...})`) rather than re-exported (`export { default } from "next-auth/middleware"`) — the build's static analyzer rejects a bare re-export with "must export a function" even though it resolves to one at runtime.
- A page with no dynamic API calls (`headers()`, `cookies()`, `searchParams`, etc.) is prerendered as static by default — see the `force-dynamic` note on `(customer)/page.tsx` above. Check `next build`'s route table (`ƒ` vs `○`) after touching any page that reads real time or request state.

## Testing

- `npm test` — Vitest unit tests for everything in `src/lib/booking/*.test.ts`. No DB needed.
- `npm run test:integration` — Vitest against the API route handlers directly (imports `POST`/`GET`/`PATCH` from each `route.ts` and calls them with a constructed `NextRequest`, no HTTP server). Requires a disposable Postgres on `localhost:5433`: `docker compose up -d`, then set `DATABASE_URL_TEST` in `.env` (see `.env.example`). `vitest.integration.config.ts`'s `globalSetup` runs `prisma migrate deploy` against it automatically. Admin-route tests mock `next-auth/next`'s `getServerSession` directly (via `vi.mock`) rather than faking real session cookies — that's the correct boundary to test at; NextAuth's own cookie/session issuance is not this repo's concern.
- Both suites were verified passing (`npm test`) resp. verified to fail cleanly at the DB-connection step (`npm run test:integration`, no Docker available in the environment this was built in) — run the integration suite for real before trusting it further.

## Conventions

- Match the prototype's validation/reset semantics exactly, not just its look: an error only *clears* once a field becomes valid (never proactively shown while typing an untouched/intermediate-invalid value) — see `ContactForm.tsx`'s `nameErrorVisible`/`phoneErrorVisible` local state.
- Verify any change against the manual checklist in the root `CLAUDE.md` (date/time gating, phone validation edge cases, Buddhist-era date, booking code format, stepper hidden on success, full reset).

## Deploying

Not yet done — requires the project owner's own credentials:

1. Create a Supabase project (Project Settings → Database → connection strings for `DATABASE_URL`/`DIRECT_URL`, see `.env.example`).
2. `npx prisma migrate deploy` against it, then `npx prisma db seed` (with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set) to create the one admin account.
3. Import the GitHub repo into Vercel, root directory `web/`, build command `prisma generate && prisma migrate deploy && next build`, and set the env vars from `.env.example` (except `ADMIN_EMAIL`/`ADMIN_PASSWORD`, which are seed-only and never touch the running app).
