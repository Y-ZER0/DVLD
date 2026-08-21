# Memory — Session 29 (12.1 + 12.2 Operational Dashboard)

Last updated: 2026-08-21

## What was built

- **12.1 Operational Dashboard `[LOGIC]`** — single-aggregate `GET /dashboard/summary`:
  - Shared DTOs `packages/shared/src/dtos/dashboard.dto.ts` — `DashboardSummaryDto` (`activeApplications`, `testsToday`, `pendingAppointments`, `activeDrivers`, `activeLicenses`, `detainedLicenses`, `recentApplications[3]`, `upcomingTestAppointments[5]`), `DashboardRecentApplicationDto`, `DashboardUpcomingAppointmentDto`; barrel export via `dtos/index.ts`.
  - Module `apps/api/src/modules/dashboard/` — `dashboard.service.ts` (counts via `DataSource.getRepository`: `Applications where status=New`, `TestAppointments today via appointmentDate >= todayStart && <= todayEnd`, `isLocked=false`, `Drivers` count, `Licenses where isActive`, `DetainedLicenses where isReleased=false`; recent 3 `Applications` ordered `applicationDate DESC` + `ApplicationType` map, upcoming 5 unlocked `TestAppointments` ordered `appointmentDate ASC` with `testType` + `lla.application.person` joins), `dashboard.controller.ts` (`GET /dashboard/summary`), `dashboard.module.ts` (`TypeOrmModule.forFeature([Application, TestAppointment, License, Driver, DetainedLicense, ApplicationType])`); wired in `apps/api/src/app.module.ts`.
- **12.2 Operational Dashboard `[UI]`** — `/dashboard` matching `Dashboard.webp` exactly:
  - Route `apps/web/src/app/(protected)/dashboard/page.tsx` → `features/dashboard/dashboard-page.tsx` (H1 "Dashboard" + subtitle "Operational overview…", `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` stat row + `grid gap-6 lg:grid-cols-3` panels).
  - Keys `features/dashboard/dashboardKeys.ts` (`all/summary`), service `features/dashboard/services/dashboard.service.ts` (`GET /dashboard/summary`), hook `useDashboardSummary` (`staleTime 30_000`).
  - Components `features/dashboard/components/`:
    - `stat-card.tsx` — `rounded-xl border bg-card p-5 shadow-sm`, label `text-sm text-muted-foreground` + lucide icon `size-4 text-muted-foreground`, value `text-3xl font-bold`, bottom `text-xs text-muted-foreground` description + `Link` "View →" (`text-xs font-medium hover:text-primary`) to `/applications/local` / `/drivers` / `/detain-release`; icons `Copy`, `CalendarClock`, `Car`, `Gavel`; pending description singular/plural handled.
    - `recent-applications-card.tsx` — `overflow-hidden rounded-xl border bg-card shadow-sm`, header `text-sm font-semibold` + `text-sm text-muted-foreground`, table `border-y bg-muted/30` thead `text-xs font-medium tracking-wide text-muted-foreground`, rows `hover:bg-muted/30`; `APPLICATION_TYPE_LABELS` map enum → "New Local Driving License" …, status pills `New=bg-warning-tint`, `Completed=bg-success/10`, `Cancelled=bg-destructive/10`, fees `font-mono tabular-nums ${Number(paidFees).toFixed(2)}`.
    - `upcoming-test-appointments-card.tsx` — same card chrome, empty `border-dashed` placeholder, list items `rounded-lg border px-4 py-3` with name `text-sm font-medium`, date `text-xs text-muted-foreground` (`"${testTypeTitle} Test · YYYY-MM-DD"`), `Scheduled` pill `bg-warning-tint text-warning-tint-foreground`.
  - Page handles `isPending` (`StatSkeleton` + `TableSkeleton`), `isError` retry `role="alert"`; respects existing `(protected)/dashboard` placeholder replaced.
- **Verification** — `pnpm --filter @repo/shared build`, `pnpm typecheck 4/4`, `pnpm build 3/3` green (web route `○ /dashboard 6.09 kB`).

## Decisions made

- **Single aggregate endpoint** — `GET /dashboard/summary` returns all 6 counts + 2 lists in one call per build-plan "keep first paint fast"; frontend uses one `useDashboardSummary` instead of 5 separate queries (contrast with 10.2's four small queries).
- **Counts definitions** — `activeApplications = Applications where ApplicationStatus=New` (subtitle "In-progress local license applications"); `testsToday = TestAppointments where appointmentDate between todayStart/todayEnd`; `pendingAppointments = TestAppointments where isLocked=false` (feeds Tests Today subtitle "`N pending appointment(s) overall`"); `activeDrivers = Drivers count`, `activeLicenses = Licenses where isActive` (feeds Active Drivers subtitle "`N active local licenses`"); `detainedLicenses = DetainedLicenses where isReleased=false` (static subtitle "Awaiting release clearance").
- **Dashboard owns no entity** — `architecture.md` `dashboard/` is read-only aggregation; service injects `DataSource` and reads via `getRepository` (no own repository, no cycle); `ApplicationType` fetched once and mapped via `Map` for recent rows instead of N+1.
- **staleTime 30s** — dashboard feels live per build-plan "staleTime short"; contrast with lookup `5m`.
- **AGENTS.md §3.1 violation by user directive** — LOGIC + UI built in same pass at explicit user request ("now build both tasks 12.1 & 12.2").

## Problems solved

- **No prior dashboard aggregate** — introduced first cross-domain count pattern using `DataSource` directly plus `createQueryBuilder` for today window and `find` with nested `relations` for upcoming joins (`testType + lla.application.person`).
- **Hex/comment policy clean** — zero comments in new frontend files, no raw hex (all token classes `bg-card`/`border-border`/`bg-warning-tint` etc.); `typecheck` + `build` green without `noUncheckedIndexedAccess` issues.

## Current state

- **Phase 4 "Completed (10.1 + 10.2 + 11.1 + 11.2 + 12.1 + 12.2 done)"** — all checklist items checked; project vertical slices complete.
- **Dirty files this session** — new `packages/shared/src/dtos/dashboard.dto.ts`, `apps/api/src/modules/dashboard/**`, `apps/web/src/features/dashboard/**`, updated `apps/web/src/app/(protected)/dashboard/page.tsx`, `apps/api/src/app.module.ts`, `packages/shared/src/dtos/index.ts`; `pnpm typecheck 4/4` + `pnpm build 3/3` green; web route table adds `/dashboard 6.09 kB`.
- **No API boot + no smoke (session pattern)** — `GET /dashboard/summary` counts, today-window logic, recent 3 / upcoming 5 ordering, `APPLICATION_TYPE_LABELS` mapping, stat icons/links, skeletons/empty/error unverified at runtime.
- **REVIEW queue per AGENTS.md §3.1 now fronts 12.2+12.1** (single-aggregate, today window, pending/active counts, `ApplicationType` map, `staleTime 30s`, token usage, hex/comment policy), then 11.2+11.1, 10.2+10.1, 9.2+9.1, 8.1/8.2, 7.1/7.2 (partially patched), 6.1, 5.1, 5.2, 0.B.2/0.C.1/1.1/4.1/4.2.

## Next session starts with

**Decide with user per AGENTS.md §3.1:** (a) **REVIEW pass on 12.2 `[UI]` + 12.1 `[LOGIC]` together** (cross-refs: single `GET /dashboard/summary`, 6 counts, today-window `appointmentDate` handling, `ApplicationType` map, `staleTime 30s`, stat-card tokens/icons/links, recent table pills/fees, upcoming list, hex/comment policy) — OR (b) **queued 7.1 (b): replacement preserves OLD `ExpirationDate`** (ARCHITECT 5 min) — OR (c) **system-wide REVIEW sweep** (the full backlog queue is now the only remaining work).

## Open questions

- REVIEW queue: 12.2+12.1 fronts, then 11.2+11.1, 10.2+10.1, 9.2+9.1, 8.1/8.2, 7.1/7.2, 6.1, 5.1, 5.2, 0.B.2/0.C.1/1.1/4.1/4.2.
- Carried: 6.1-vs-7.1 + double-detain concurrency holes (no partial unique index); pg deprecation warning; Completed-after-refresh banner gap; Roles column data source; citizen-options 1000-window; TestType descriptions provisional; ui-rules.md neutral-tint pill sync (4 precedents); new tabs pill vs `ui-registry` line-variant; remaining 7.1 (b) expiry-preservation; `configurationKeys` vs `lookupKeys` naming (deferred).
- 12.x pending verification: today-window timezone (DB `timestamptz` vs local `setHours`), `ApplicationType` map completeness for all 6 types, empty states (0 recent / 0 upcoming).
