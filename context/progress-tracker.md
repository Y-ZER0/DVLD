# progress-tracker.md

This file is updated by the **REMEMBER** skill at the end of every session
(`AGENTS.md § 4`). Check off items exactly as they're completed — don't batch
checkmarks after the fact, and don't check a `[UI]` item off before its
paired `[LOGIC]` item is checked and reviewed.

---

## Phase Status

| Phase | Status |
|---|---|
| Phase 0 — Foundation Setup | In Progress (0.A + 0.B done) |
| Phase 1 — Foundation | In Progress (1.1 + 1.2 + 2.1 + 2.2 + 3.1 done) |
| Phase 2 — Application Lifecycle & Testing | In Progress (4.1 + 4.2 + 5.1 + 5.2 + 6.1 + 6.2 done) |
| Phase 3 — Advanced License Services | Not Started |
| Phase 4 — Utilities & Reports | Not Started |

---

## Checklist (mirrors build-plan.md)

### Phase 0
- [x] 0.A — Monorepo, Database & Shared Package Scaffold `[LOGIC]`
- [x] 0.B.1 — Authentication `[LOGIC]`
- [x] 0.B.2 — Authentication `[UI]`
- [x] 0.C.1 — Application Shell & Navigation `[UI]`

### Phase 1
- [x] 1.1 — People Management `[LOGIC]`
- [x] 1.2 — People Management `[UI]`
- [x] 2.1 — User Management `[LOGIC]`
- [x] 2.2 — User Management `[UI]`
- [x] 3.1 — Lookup Data `[LOGIC]`

### Phase 2
- [x] 4.1 — Local Driving License Applications `[LOGIC]`
- [x] 4.2 — Local Driving License Applications `[UI]`
- [x] 5.1 — Test Appointment & Results System `[LOGIC]`
- [x] 5.2 — Test Appointment & Results System `[UI]`
- [x] 6.1 — License Issuance `[LOGIC]`
- [x] 6.2 — License Issuance `[UI]`

### Phase 3
- [ ] 7.1 — License Renewal & Replacement `[LOGIC]`
- [ ] 7.2 — License Renewal & Replacement `[UI]`
- [ ] 8.1 — International License Service `[LOGIC]`
- [ ] 8.2 — International License Service `[UI]`
- [ ] 9.1 — Detain & Release System `[LOGIC]`
- [ ] 9.2 — Detain & Release System `[UI]`

### Phase 4
- [ ] 10.1 — Driver & License History `[LOGIC]`
- [ ] 10.2 — Driver & License History `[UI]`
- [ ] 11.1 — Configuration `[LOGIC]`
- [ ] 11.2 — Configuration `[UI]`
- [ ] 12.1 — Operational Dashboard `[LOGIC]`
- [ ] 12.2 — Operational Dashboard `[UI]`

---

## Session Log

Add one entry per session, newest at the top. This is where architectural
decisions, deviations from the plan, and "start here next time" notes live —
`progress-tracker.md`'s checklist alone won't capture *why* something was
built a certain way.

### Template (copy this for each new entry)

```
### Session N — YYYY-MM-DD
**Completed:** <checklist items checked this session>
**Decisions made:** <any architectural call not already in architecture.md,
and why — if it should become a permanent invariant, add it there too>
**Deviations from plan:** <anything built differently than build-plan.md
described, and why>
**Known issues / follow-ups:** <anything left rough>
**Start next session with:** <the very next unchecked item, plus any context
needed to jump back in cold>
```

### Example entry (illustrative only — delete once real sessions begin)

```
### Session 0 — example
**Completed:** none yet — this is a placeholder showing the expected format.
**Decisions made:** n/a
**Deviations from plan:** n/a
**Known issues / follow-ups:** n/a
**Start next session with:** 0.A — Monorepo, Database & Shared Package Scaffold
```

### Session 17 — 2026-08-19
**Completed:** **6.2 — License Issuance `[UI]`** (full vertical slice: web request DTO, service method, mutation hook, issuance modal, applicant-card banner states, page wiring). Built per the user's exact descriptive prompts; no API smoke (user directive).
**Decisions made:**
- **Issued license rides page state, not a second fetch** — `IssueLicenseModal` lifts the mutation's returned `LicenseDto` up via `onIssued`; the ApplicantCard banner renders id/dates from server truth. The 6.1 detail DTO carries no license fields, and there is no license-by-application endpoint — a second read didn't exist to add without LOGIC work.
- **Three footer cases on the ApplicantCard, not two** — (1) `issuedLicense` state → full banner "License LIC-N issued / Valid a to b"; (2) status `Completed` without state (page refreshed after success) → banner with no fabricated specifics — the one-way door means the CTA must never be re-offered; (3) the 5.2 two-state CTA, enabled variant now wired to the modal. Completed-after-refresh previously would have re-rendered a live (doomed 409) issuance button — pre-existing edge, fixed by the COMPLETED branch.
- **Hook invalidates `detail(id)` + `lists()`** — status → Completed refetches the detail pill, the disappearing Cancel button, and every register row's pill (invariant #6). Pipeline query deliberately NOT invalidated (issuance doesn't change stages). **Build-plan § 6.2's drivers-list invalidation deferred** — no `driversKeys`/drivers feature exists until Feature 10 (Session 16 memory note; commented in-file).
- **Subtitle sentence is the spec's exact copy with live values** — "Issue a {className} license to {name}. Fee: ${classFees} (live via `useLicenseClasses`, invariant #28). If the applicant is not yet a driver, a driver record is created automatically." (front-end face of invariant #23).
- **Notes placeholder "First time issuance." = FirstTime issue-reason copy** (only reason this feature issues; 7.x modals will vary it). Focus ring = shadcn Textarea default (ring token #2563EB) — nothing custom.
- Banner = Imprint-worthy: `bg-success-tint` + `border-success/20` (Passed-stage precedent), `text-success` headline + `Award` icon, mono `LIC-{id}`, muted validity line with raw YYYY-MM-DD dates (registry ConfirmationBanner sample format).
**Deviations from plan:** none of substance — drivers-list invalidation deferred (above); banner also renders on the Completed-without-state case (above, + fix not a deviation).
**Known issues / follow-ups:**
- **No API boot + no smoke (user directive)** — `pnpm typecheck` 4/4, `pnpm build` green (route table unchanged; `/applications/local/[id]` 8.69 kB → 9.12 kB with the modal). Issue-license roundtrip + all 409 paths unverified at runtime.
- **REVIEWs still owed (user's call): 6.1** (now has its 6.2 consumer to check against), **5.1, 5.2, backlog 0.B.2/0.C.1/1.1/4.1/4.2**.
- The Completed-after-refresh banner shows no license number/dates (data doesn't exist client-side) — acceptable; a future license-summary field on the detail DTO (7.2 register reuse) would close it.
- Carried: pg deprecation warning; TestType descriptions provisional; citizen-options 1000-window; Roles column data-source decision (now partially unblocked — Drivers table exists).
**Start next session with:** **REVIEW pass on 6.1 `[LOGIC]`** (invariant cross-refs: #9 single DTO, #11 toDto gate, #22 pipeline re-verification, #23 one-transaction driver find-or-create, #26 active-same-class guard inside the tx, #28 fee snapshot, #29 session user, transaction atomicity; manager-parameter cross-domain methods are the new pattern to scrutinize), then decide with the user: 7.x next per build-plan, or clear the 5.1/5.2/backlog REVIEW queue first.

### Session 16 — 2026-08-19
**Completed:** **6.1 — License Issuance `[LOGIC]`** (full vertical slice: MCP migration, shared contracts, Drivers module, Licenses module with entity/repository/service/controller; no UI code touched). Built directly per user directive — no REVIEW passes run on 5.1/5.2/6.1, no ARCHITECT skill, no API smoke.
**Decisions made:**
- **Schema via Supabase MCP `create_drivers_licenses_tables`** (Session 11/12/14 precedent, user directive) — BOTH missing tables created in one migration: `Drivers` (SERIAL PK, `PersonID UNIQUE` FK → People NO ACTION, CreatedByUserID FK, `CreatedDate timestamptz`) + `Licenses` (SERIAL PK, `ApplicationID UNIQUE` FK → Applications, DriverID/LicenseClassID/CreatedByUserID FKs, `IssueDate`/`ExpirationDate` DATE, nullable `Notes`, `PaidFees numeric(10,2)`, `IsActive BOOLEAN NOT NULL DEFAULT true`, `IssueReason INTEGER`, + indexes on DriverID and LicenseClassID for the Feature 7/10 register reads). No TypeORM migration file.
- **New `modules/drivers/` module created NOW (not at Feature 10)** — invariant #23 needs the Drivers row at issuance. Minimal: `Driver` entity + `DriversService.findOrCreateByPersonId(manager, personId, actingUserId)` — **manager-parameter pattern**: the find-or-create executes on the CALLER's transaction manager so it is atomic with the Licenses insert (invariant #23); the DB's unique PersonID backstops a concurrent first-issuance race (loser's transaction rolls back whole — no retry). No repository class yet (the only read runs on a foreign manager; repository would be dead code — TestsRepository precedent). `exports: [DriversService]`.
- **New `modules/licenses/` = the architecture.md "issuance, renewal, replacement" home** — `License` entity (relations: application one-to-one, driver, licenseClass; JoinColumns mirror DBML), `LicensesRepository.findById` (joined driver.person + licenseClass), `IssueLicenseRequestDto` (notes optional ≤500), `LicensesService.issueLicense`, `LicensesController`. Feature 7/8 extend this module.
- **Route ownership: LicensesController uses `@Controller('local-license-applications')` for `POST :id/issue-license`** — build-plan § 6.1's product contract puts the action on the application's resource path; putting the route on the applications controller instead would create a module cycle (licenses → applications is required for the gates), so the licenses module owns the route with the foreign prefix (documented in the controller header).
- **issueLicense() = ONE transaction with 4 writes**: (a) driver find-or-create via DriversService (invariant #23), (b) **invariant #26 guard** — `manager.findOne(License, { driverId, licenseClassId, isActive: true })` inside the transaction (NOT via repository — a repo call would run on its own connection and see pre-transaction state); active-same-class → 409, (c) Licenses insert, (d) application completion. **Completion of a foreign domain's row uses a second manager-parameter service method: `LocalLicenseApplicationsService.completeInTransaction(manager, applicationId, completedAt)`** (mirrors cancel()'s LastStatusDate stamping; same pattern as DriversService) — atomic completion instead of importing the Application entity into the licenses module.
- **IssueReason stays a plain int** (DBML note '1:FirstTime..4:Replacement(Lost)') — Session 12's enum conversion was a user directive for ApplicationStatus only; new shared `IssueReason` enum mirrors the 1-4 ints.
- **Pipeline re-verification via TestingService.getPipeline** (TestingModule now exports TestingService) — `stages.every(status === 'Passed')` else 409 (invariant #22 — never trust the UI's disabled button); the read is fresh (re-reads the appointments inside getPipeline).
- **Gates order: 404 (app) → 409 status-not-New (Cancelled/Completed one-way door) → 409 pipeline → 404 class → transaction** (class read outside the transaction is fine — fee/validity config rows, immutable during the write; lookup reads are the 5.1 precedent).
- **ExpirationDate via date-fns** (already in api): `addYears(issueDate, DefaultValidityLength)` with `format(..., 'yyyy-MM-dd')` — local-midnight-safe for the DATE columns (Person.dateOfBirth pattern); IssueDate = `new Date()` formatted the same way.
- **Full `LicenseDto` returned** (shared: id, applicationId, driverId, driverName, nationalNumber, licenseClassId, className, issueDate, expirationDate, notes, paidFees, isActive, issueReason) — the contract Feature 7.2's register columns and 10.1's history reuse; 6.2's success card only consumes id/dates of it.
**Deviations from plan:** none of substance — Drivers module created early (invariant #23 demands it; plan listed it under Feature 10); invariant #26 guard added at issuance (plan's § 6.1 lists 4 steps; the "never two active same-class licenses" rule is absolute and renewal's transaction enforces it — issuance is the other door into the Licenses table, so it got the mirror guard); route lives on the licenses module (above).
**Known issues / follow-ups:**
- **No API boot + no smoke (user directive)** — `pnpm typecheck` 4/4, `pnpm build` (nest + next route table unchanged, `/applications/local/[id]` 8.69 kB), lint n/a for api/web. The new route + migration unverified at runtime.
- **REVIEWs still owed (AGENTS.md § 3.1): 6.1 `[LOGIC]` itself, then 5.1 + 5.2, backlog 0.B.2, 0.C.1, 1.1, 4.1, 4.2** — user continues to build by directive (skip list for next session is the user's call).
- Transactional cross-domain manager-parameter methods (DriversService.findOrCreateByPersonId, LocalLicenseApplicationsService.completeInTransaction) are a NEW codebase pattern — REVIEW should confirm they don't blur the module boundary; the alternative (importing foreign entities into licenses.service) was rejected as worse.
- pg deprecation warning on boot (carried); TestType descriptions provisional (carried); Roles column pending Drivers (now partially unblocked — Drivers table EXISTS; the 1.2 roles column still needs a data source decision); citizen-options 1000-window (carried).
**Start next session with:** **6.2 — License Issuance `[UI]`** per build-plan § 6.2 (wire the currently-inert Issue License CTA on `local-license-application-detail-page.tsx` — it already renders both states from Session 15, `bg-muted-solid` disabled + `bg-primary` enabled-when-all-Passed; the click currently inert by design): `IssueLicenseModal` (summary: class/applicant/fee live from `useLicenseClasses`, Notes ≤500, confirm), success state replacing the button with the inline "License LIC-N issued — Valid <issue> to <expiry>" card, `useIssueLicense` hook + `issueLicenseKeys`/service against `POST /local-license-applications/:id/issue-license` (IssueLicenseRequestDto = `{ notes? }` — web DTO already mirrors the backend class), invalidating the application detail (+ drivers list later) on success. Then REVIEW pass on 6.1 `[LOGIC]` + 6.2 `[UI]` unless user redirects.

### Session 15 — 2026-08-18
**Completed:** **5.2 — Test Appointment & Results System `[UI]`** (full vertical slice: 5 new tokens, test-types lookup hook, pipeline query key, testing service + 2 request DTOs, 3 hooks, 4 components, detail page rebuilt to the user's descriptive prompts).
**Decisions made:**
- **Spec-driven detail page** (user provided exact descriptive prompts; built to match): back link + H1 `Application L-{id}` + inline muted "filed <date>"; Cancel = soft-red tint button (`bg-destructive-tint border-destructive/30 text-destructive`, New-only); LEFT card = "Applicant" header, soft-blue avatar initials, divider, right-aligned KV rows (Status pill / License Class / Application Fee snapshot / **License Fee (on issue) read live from `useLicenseClasses`** — invariant #28), footer CTA full-width with the disabled gray-blue "Issue License (pass all tests first)" (title explains why; Feature 6.2 wires the click) vs `bg-primary` "Issue License" when every stage is Passed (invariant #22 mirror); RIGHT card = one container, Test Pipeline (exact spec subtitle) + divider + Appointment History.
- **Five new soft-status tokens added to `ui-tokens.md` + `globals.css`** (token-first rule): `success-tint` #F0FDF4 / `success-tint-foreground` #15803D, `warning-tint` #FEF3C7 / `warning-tint-foreground` #B45309, `destructive-tint` #FEE2E2, `neutral-tint` #E2E8F0 / `neutral-tint-foreground` #475569, `muted-solid` #94A3B8 — the spec's soft pill/card colorways without raw hexes in components.
- **Actions gated on status New (`canAct`)** — dead applications render Schedule/Record buttons visibly disabled with explanatory `title` (ui-rules disabled rule; the 5.1 service 409s anyway); pipeline stages unchanged for Cancelled/Completed.
- **Hooks: `useTestPipeline` keyed at `localLicenseApplicationKeys.pipeline(id)`** (detail-branch child — one application, one pipeline); both mutations invalidate `detail(id)` AND `pipeline(id)` on success (invariant #6). `useRecordTestResult(applicationId)` takes `{ appointmentId, dto }` payload — the appointment id rides with the action, the hook binds the invalidation target.
- **RecordResultModal** = exact spec: ~480px (`max-w-[480px]`), title + the exact lock-warning subtitle copy, Result select over the 5.1 `passed|failed` vocabulary, notes textarea (500 max mirror), `bg-background` footer strip, Cancel + "Save & Lock".
- **ScheduleAppointmentModal** = FormModal chrome, live fee notice per stage's test type via new `useTestTypes` (invariant #28), native date input with the person DOB calendar treatment (`showPicker()` etc.).
- **Attempt count derived from history** (`history.filter(testTypeId && failed)`) — the retake "· N failed attempt(s)" hint on Schedule-state stages (Session 14 contract: history is the retake source).
- **Pills**: Pending `bg-warning-tint text-warning-tint-foreground`; Passed `bg-success/15 text-success-tint-foreground`; Failed `bg-destructive-tint text-destructive`; Locked `bg-neutral-tint text-neutral-tint-foreground` — tint family consistent across stepper + history + detail Status pill (detail Status pill also re-tinted; list 4.2 pill classes left untouched).
**Deviations from plan:** minor — `useTestTypes` hook + `lookupKeys.testTypes()` added (plan's "fee notice read live from findAllTestTypes" required them); Issue License button shipped in BOTH states per the user's prompt though Feature 6.2 formally owns it (rendered inert with comment — no fake action).
**Known issues / follow-ups:**
- **No API boot + no smoke** (session pattern) — `pnpm typecheck` + `pnpm build` green (route table unchanged; `/applications/local/[id]` rebuilt). Pipeline/schedule/record roundtrips + both modals unverified at runtime.
- **5.1 + 4.1 REVIEW still owed** (AGENTS.md § 3.1), now joined by **5.2 `[UI]` REVIEW**; backlog REVIEWs (0.B.2, 0.C.1, 1.1, 4.2) carried. REVIEW first, then 6.1 per § 3.1.
- Detail Status pill uses the new tint tokens while the 4.2 list uses the older `bg-warning/10` family — visually consistent family, flag for the 4.2 REVIEW.

### Session 14 — 2026-08-18
**Completed:** **5.1 — Test Appointment & Results System `[LOGIC]`** (full vertical slice: MCP migration, 2 entities, repository, service, controller, 2 request DTOs, LookupService + shared contracts; no UI code touched).
**Decisions made:**
- **Schema via Supabase MCP `create_test_tables`** (Session 11/12 precedent, user directive) — `TestAppointments` (SERIAL PK, FKs TestTypeID/LocalDrivingLicenseApplicationID/CreatedByUserID `ON DELETE NO ACTION`, `AppointmentDate timestamptz`, `PaidFees numeric(10,2)`, `IsLocked boolean NOT NULL DEFAULT false`, + index on LocalDrivingLicenseApplicationID for the pipeline reads) + `Tests` (SERIAL PK, `TestAppointmentID UNIQUE` FK, `TestResult boolean`, nullable `Notes`, CreatedByUserID). No TypeORM migration file.
- **Application id rides the URL for scheduling** — `POST /test-appointments/:localDrivingLicenseApplicationId` with the build-plan DTO unchanged (testTypeId, appointmentDate): the client always schedules from the application detail screen, so the id is already in its URL; the plan's DTO shape stays exactly as specified.
- **Pipeline contract (ARCHITECT, user-confirmed, refined mid-session)** — `GET /test-appointments/pipeline/:localDrivingLicenseApplicationId` returns `{ applicationId, stages[3], history[] }`. **Stages carry EXACTLY four statuses (user spec — no Failed/Pending on stages):** `Passed` (any recorded true result, forever), `Schedule` (CURRENT stage — first not-yet-passed — with no open booking; retake after a fail IS the current stage until it passes), `Scheduled` (current stage with an open unlocked booking — date + fee + Record Result button), `Locked` (every stage beyond current, grayed). Current = first non-passed stage, computed server-side (no isCurrent flag needed — the spec resolved it). **History = the 3 render cases only** (pending / passed+locked / failed+locked), newest first, each with nested result (incl. notes). No result-date column needed (user: no completed date display). Booking an already-passed stage is additionally 409 (phantom-history guard).
- **Two guards beyond build-plan (ARCHITECT, user-confirmed):** (a) **double-scheduling 409** — one unlocked slot per stage (`findUnlockedForStage`), a second booking is a client error; (b) **New-status-only 409** — both schedule and recordResult reject on a Cancelled/Completed application (one-way-door principle, mirrors Feature 4 cancel semantics).
- **recordResult = ONE transaction** (Tests insert + `IsLocked = true` flip, code-standards § 4) — deliberate refinement over the § 5 worked example's sequential awaits: a crash must never leave a result on an unlocked slot. The DB unique TestAppointmentID backstops the race; the catch maps 23505 → 409 (Session 6 23503 precedent).
- **Stage order from the seeded TestTypes id order** via `LookupService.findAllTestTypes()` position index (repo comment already declared id order = staging order, invariant #19); unknown-id / out-of-sequence → 404 / drift 409, never a silent pass.
- **`LocalLicenseApplicationsModule` now exports `LocalLicenseApplicationsService`** (Session 12's "5.1 will need the service — add then" note) — TestingModule reaches the application through it (404 + status), LookupModule for stage order + fee snapshot; never a foreign repository.
- **`LookupService.findTestTypeById` added** (+ `TestTypesRepository.findById`) — the fee-snapshot + 404 source (findLicenseClassById precedent).
- **No TestsRepository** — the Tests row is written via the manager inside the service transaction (Application-parent precedent, Session 12).
- **403-free: $ route order safe** — `GET pipeline/:id` declared before the parameterized routes; no route-shape collisions.
**Deviations from plan:** none of substance — scheduling path param (above); no TestsRepository (above); `RecordTestResultRequestDto.result` is a `'passed' | 'failed'` string union (`@IsIn`), matching the code-standards § 5 worked example, mapped to the boolean column in the service. **Mid-session contract refinement (user):** 4-exclusive stage statuses (above) replace the initial Pending/Failed model; `Tests.ResultDate` column NOT added (user: no completed date needed); extra 409 on re-booking a passed stage (phantom-history guard, above).
**Known issues / follow-ups:**
- **No API boot + no smoke (user directive this session)** — verified `pnpm typecheck` / `lint` / `build` green instead (nest build + next build route table unchanged). The 3 new routes, the earlier 4.1 routes, and the MCP migration are unverified at runtime.
- **4.1 REVIEW still owed — now joined by 5.1** (AGENTS.md § 3.1; user continues to build by directive). Also still owed: 0.B.2, 0.C.1, 1.1 backlog, 4.2 itself.
- Shared entity circular import (TestAppointment ↔ Test, standard TypeORM OneToOne inverse pattern) — expected fine, confirmed only at boot.
**Start next session with:** **REVIEW pass on 4.1 `[LOGIC]` + 5.1 `[LOGIC]`** (invariant cross-refs: #9 single DTO, #11 toDto gates, #19 predecessor gate + order derivation, #20 locked guard + transaction atomicity, #21 retake semantics, #28 fee snapshot at booking time, #29 session user on both writes + 23505 race path, #31 no roles; step comments; controller-thin), then **5.2 — Test Appointment & Results System `[UI]`** — ARCHITECT first: `TestPipelineCard` (three-row stepper fed by `GET /test-appointments/pipeline/:id`), `ScheduleAppointmentModal` (date field + fee notice read live from `findAllTestTypes`), `RecordResultModal` (Passed/Failed select + notes + "permanently locks" warning), `AppointmentHistoryList`; hooks `useTestPipeline` / `useScheduleTestAppointment` / `useRecordTestResult` invalidating `localLicenseApplicationKeys.detail(id)`; the 4.2 detail page's placeholder right card is the plug-in point.

### Session 13 — 2026-08-18
**Completed:** **4.2 — Local Driving License Applications `[UI]`** (full vertical slice: routes, keys factory, service, 5 hooks, list DataTable, New modal, detail shell, cancel confirm).
**Decisions made:**
- **New `features/lookup/` on the web side (ARCHITECT call)** — the 4.2 modal needs license classes (min-age labels) + application types (fee notice) live, and no lookup hooks existed. `lookupKeys` + `lookupService` + `useLicenseClasses` / `useApplicationTypes` (5-min staleTime per library-docs § 4). Feature 11.2 reuses these; test-types method included for completeness.
- **Citizen combobox feed = page-1/pageSize-1000 ride on `GET /people` (ARCHITECT call, UI-only constraint)** — no dedicated plain-array citizens endpoint exists (4.1 is closed; a new endpoint is LOGIC work), and the picker must type-to-filter over the FULL set (ui-registry Combobox). Housed in the applications service (cross-route precedent: `userService.getUnlinkedPeople` on `/people/unlinked`, invariant #13), keyed at `localLicenseApplicationKeys.citizenOptions()`. **Flagged follow-up:** a `/people/options`-style endpoint when the registry outgrows the window.
- **Test Progress column = placeholder** — Feature 5 owns pipeline state; every row renders an empty `bg-primary`-on-`bg-muted` track + "0/3" with a comment marking the 5.2 replacement.
- **Status pill mapping reused verbatim from UserStatusCell** (bg-warning/10 New, bg-success/10 Completed, bg-destructive/10 Cancelled) — ui-rules § Status Color Mapping; color + label never alone.
- **App No. renders `L-{applicationId}`** (the generic Applications row id) in mono+bold, per the reference screenshots.
- **Cancel Application only renders for `New` status** (detail header, top-right, outline-destructive treatment) — one-way door, so nothing to cancel otherwise; confirm via AlertDialog (409 stay-open, `Keep Application` cancel), invalidates lists + detail.
- **Detail shell = first TwoColumnDetailLayout implementation** (360px left summary card / flexible right Test Pipeline placeholder card, stacks below `lg`); the left card is informational until Feature 6 wires the issue action (no fake button now). Loading = Skeleton cards in the same grid; error = centered retry card.
- **`shadcn add skeleton`** — new primitive via CLI (generates untouched per code-standards).
- **New modal = second FormModal implementation** (PersonFormModal template: `max-w-lg` per ~500px spec, title + description with the LIVE fee notice, fields grid, `bg-background` footer strip). License Class select uses `Select` (AnnotatedSelect labels) with pending/error handling; Applicant uses `SearchableCombobox` via RHF `Controller`.
**Deviations from plan:** none of substance — hooks ship one more than build-plan listed (`useCitizenOptions`); citizen feed rides the paginated register (above); 4.1 REVIEW still owes before 5.1 per AGENTS.md § 3.1 (user directive built 4.2 anyway).
**Known issues / follow-ups:**
- **No live browser/API smoke** (carried pattern) — table/list/modal/detail/cancel roundtrips unverified at runtime. `pnpm typecheck` + `pnpm build` green; both routes in the build table (`/applications/local` static, `/applications/local/[id]` dynamic). The API itself was already smoke-verified booting with all 4 application routes (Session 12).
- **REVIEWs still owed** (AGENTS.md § 3.1): 4.1 `[LOGIC]` (mandated before 5.1), plus backlog 0.B.2, 0.C.1, 1.1; and now 4.2 `[UI]` itself once 5.1 is queued.
- Citizen-options 1000-window follow-up (above); `useLocalLicenseApplication` uses a non-null `id as number` cast guarded by `enabled` — fine for the route, noted for REVIEW.
**Start next session with:** **REVIEW pass on 4.1 `[LOGIC]` + 4.2 `[UI]`** (invariant cross-refs: #9 single DTO, #11 toDto gate, #28 fee snapshot live-lookup reads, #29 session user, #31 no roles; step comments; controller-thin; transaction atomicity; cancel one-way door), then **5.1 — Test Appointment & Results System `[LOGIC]`**: `TestAppointment` + `Test` entities + migrations (Supabase MCP precedent), `ScheduleTestAppointmentRequestDto` (testTypeId, appointmentDate), service rejects scheduling a stage whose predecessor hasn't Passed (invariant #19), fee snapshot on `PaidFees`, `RecordTestResultRequestDto` + `recordResult()` (locked-appointment guard #20/#21, lock on write), pipeline-state endpoint for the detail page, `POST /test-appointments` + `PATCH /test-appointments/:id/result`. The 4.2 detail page's Test Pipeline placeholder card and the `useLocalLicenseApplication.detail(id)` invalidation path are the exact spots 5.2 plugs into.

### Session 12 — 2026-08-18
**Completed:** **4.1 — Local Driving License Applications `[LOGIC]`** (full vertical slice; ARCHITECT pass first, no UI code touched).
**Decisions made:**
- **ApplicationStatus = Postgres enum `application_status_enum` (New/Cancelled/Completed), NOT the int 1:New/2:Cancelled/3:Completed (user directive — deviation from the architecture.md DBML).** Column stores the string labels; shared `ApplicationStatus` enum values mirror them (same pattern as Gender/ApplicationType). architecture.md DBML + enum block updated; entity header documents the deviation.
- **Schema via Supabase MCP again (Session 11 precedent, user directive)** — migration `create_application_tables` applied directly to `tvpphretcytcicjnduxg`: enum + `Applications` + `LocalDrivingLicenseApplications` (SERIAL PKs, `ON DELETE NO ACTION` FKs, unique `ApplicationID` on the child, `numeric(10,2)` PaidFees). No TypeORM migration file — creating one would replay on `migration:run` and fail.
- **datetime columns are `timestamptz`** (entity `type: 'timestamptz'`) — unambiguous and native to TypeORM; DBML still says `datetime` (mapping documented in the entity header).
- **Create = the codebase's first multi-table write, wrapped in ONE `dataSource.transaction`** (code-standards § 4): the `Applications` parent + `LocalDrivingLicenseApplications` child are inserted with the same manager; the child chains to the generated parent id. Reload-after-insert for the toDto projection (UsersService.create pattern).
- **Fee snapshot (invariant #28):** reads the `NewDrivingLicense` application-type row via the new `LookupService.findApplicationTypeByTitle()` and copies its `ApplicationFees` string onto `PaidFees` at create time — never from the client, never hardcoded. Missing config row → 404 (fail loud).
- **Age gate (library-docs.md § 2):** applicant verified against `LicenseClasses.MinimumAllowedAge` via `LookupService.findLicenseClassById()` (new single-row finders added — no full-register scan); `date-fns` added to `apps/api` (the docs' `differenceInYears` pattern — API didn't have it); `parseISO` for calendar-accurate local-midnight birthday math.
- **Cancel = one-way door:** only `New → Cancelled`; an already-cancelled or Completed application is a 409 (never a silent no-op, never walking back a completion). `LastStatusDate` stamped on every status change (create + cancel).
- **One flat DTO for list AND detail** (`LocalDrivingLicenseApplicationDto`, Session 9 flat-DTO precedent): `id` = LocalDrivingLicenseApplicationID (route identity Features 5/6 hang off), `applicationId` = the Applications row displayed as "App No." — both exposed.
- **`CreatedByUserID` from `@CurrentUser().userId`** (invariant #29) — the applications module is the first consumer of the decorator outside auth.
- **Cross-module reads only through exported services** — `PeopleService.findOne` (applicant 404) + `LookupService` (class 404, age, fee); entity relations (`ManyToOne`) mirror the User.person pattern; the module imports `PeopleModule` + `LookupModule`. `LocalLicenseApplicationsModule` exports nothing yet (5.1 will need the service — add then).
- **Repository owns the status write** — `updateApplicationStatus()` via `this.manager.update(Application, …)` (the status column lives on the parent table; no second repository needed).
**Deviations from plan:** as above — enum vs int (user directive); LookupService finder methods added (plan didn't name them); one DTO instead of a separate detail shape; filters are search + status only (class filter deferred — nothing in 4.2 needs it yet).
**Known issues / follow-ups:**
- **Endpoint round-trip smoke SKIPPED (user directive)** — verified instead: `pnpm typecheck`/`lint`/`build` all green; API boots against Supabase with all 4 new routes mapped (`GET /local-license-applications`, `POST`, `GET :id`, `PATCH :id/cancel`) + health 200. The create/list/detail/cancel happy path and the 400 age-gate / 409 cancel-guard / 404 paths are NOT live-verified — offer a smoke again next session.
- **Windows tooling gotcha (RECOVER note):** a `node dist/main.js` spawned via `Start-Process` dies when the invoking tool-session ends — server + probe must run inside ONE shell command (first two attempts died silently between calls; not an app defect).
- **4.1 REVIEW not yet run** — AGENTS.md § 3.1 mandates it before 4.2 `[UI]` starts. Still-owed backlog REVIEWs: 0.B.2, 0.C.1, 1.1.
- pg deprecation warning on boot (carried); TestType descriptions provisional (carried); Roles column strategy pending Drivers (carried).
**Start next session with:** **REVIEW pass on 4.1 `[LOGIC]`** (invariant cross-refs: #9 single DTO definition, #11 toDto gate everywhere, #28 fee snapshot at transaction time, #29 session user, #31 no roles; step comments per code-standards § 5; transaction atomicity; cancel one-way door; controller-thin), then **4.2 — Local Driving License Applications `[UI]`** — ARCHITECT first: `/applications/local` page (DataTable: App No., Applicant, Class, Test Progress x/3 placeholder, Status pill, Manage → Open), `NewLocalApplicationModal` (citizen combobox via `GET /people/unlinked`-style feed + license-class select with "(Min age N)" labels + fee notice — read live from `/lookup/application-types`, never hardcoded), `/applications/local/[id]` detail shell (left applicant summary card, right Test Pipeline placeholder), "Cancel Application" destructive action, hooks `useLocalLicenseApplications`/`useLocalLicenseApplication`/`useCreateLocalLicenseApplication`/`useCancelApplication` + `localLicenseApplicationKeys` factory.

### Session 11 — 2026-08-13
**Completed:** 2.2 `[UI]` REVIEW (1 Important finding fixed: toggle-failure error banner), **3.1 — Lookup Data `[LOGIC]`** (full slice), ImageKit convention + web scaffolding, first live API smoke in sessions.
**Decisions made:**
- **Lookup tables + seed data created via Supabase MCP (user directive)** — migration `create_lookup_tables_seed` applied directly to the hosted DB (enums `test_type_enum` + `application_type_enum`, tables `LicenseClasses`/`ApplicationTypes`/`TestTypes`, seeds 7/6/3). **Deliberate deviation from architecture.md § System Boundaries** ("migrations folder is the only way schema changes reach Supabase"): no TypeORM migration file exists for 3.1 — creating one would replay on the next `migration:run` and fail. Documented in entity header comments.
- **Seed source = build-plan.md § 3.1 inline values** (user confirmed) — `System_Requirments.md` does not exist in the repo. Class names normalized to the invariant #24 wording: `Ordinary Driving License (Car)`, `Commercial (Taxi)`.
- **TestType seed descriptions are provisional** — no source text exists anywhere in the repo ("Basic eyesight screening" / "Theoretical knowledge examination" / "Practical on-road driving test"); flagged in the migration + entity comments until the requirements file surfaces.
- **Fee fields flow through as strings** (ARCHITECT decision) — decimal(10,2) columns arrive as strings over JSON; `LicenseClassDto.classFees` etc. are `string`; all fee math stays server-side (invariant #28). Mirrored in `shared/lib/imagekit.ts` comment conventions.
- **Single LookupController, not three** (ARCHITECT refinement over the planned 3 controllers) — every other module has one controller; Feature 11's `PATCH /lookup/:kind/:id` paths land under the same prefix. Empty state: readiness decision — `LookupModule` exports `LookupService` only (cross-module access rule).
- **ImageKit convention (user note)** — `People.PhotoUrl` always stores an ImageKit URL; `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` added to web `.env.local`/`.env.example` (no secret — public endpoint only); `apps/web/src/shared/lib/imagekit.ts` `buildPersonPhotoUrl(url, {thumbnail|width|height})` applies `?tr=fo:face,w-,h-` client-side, returns the raw URL untouched when unset or endpoint missing. Nothing consumes it yet.
- **RLS advisory deliberately left as-is (user confirmed)** — Supabase advisor flags RLS disabled on People/Users/migrations; NestJS + global JwtAuthGuard remains the only access layer; no anon keys exposed client-side.
- **`incremental: true` removed from `apps/api/tsconfig.json`** — RECOVER root-cause: stale `tsconfig.tsbuildinfo` + nest-cli `deleteOutDir:true` produced a partial `dist` (only main/app.module, MODULE_NOT_FOUND `./app.controller` on boot); api compiled output had been broken since the cache went stale. Fresh rebuild emits everything; turbo caching keeps rebuilds fast.
**Deviations from plan:** as above — MCP migration instead of TypeORM migration file (user directive); one controller instead of three (documented in-file); three 2.2 REVIEW minors NOT fixed (user chose Important-only): stale delete-dialog error on reopen, STEP-number gaps in create-user modal, 420px vs max-w-lg UpdatePasswordModal width.
**Known issues / follow-ups:**
- **FIRST live API smoke done (admin login → JWT → all 3 lookup endpoints returned correct seed rows)**. New/updated endpoints verified at runtime: `/api/lookup/license-classes`, `/api/lookup/application-types`, `/api/lookup/test-types`. Historical endpoints (people/users CRUD, toggle, delete 409) still unverified live.
- pg deprecation warning on boot (`client.query()` while another query executing) — pre-existing, non-blocking, noted for a future RECOVER pass.
- Still owed REVIEWs (AGENTS.md §3.1): 0.B.2, 0.C.1, 1.1 (backlog — flag with user).
- 3.1 REVIEW run — 0 issues, gate passed (next feature unlock: 4.1 `[LOGIC]`). Session fully closed — `memory.md` overwritten with Session 11 state.
**Start next session with:** **4.1 — Local Driving License Applications `[LOGIC]`** — ARCHITECT first: `Application` + `LocalDrivingLicenseApplication` entities + migrations (via Supabase MCP per Session 11 precedent, unless user redirects), `CreateLocalLicenseApplicationRequestDto` (personId, licenseClassId), service = applicant age ≥ `LicenseClasses.MinimumAllowedAge` (use `LookupService.findAllLicenseClasses()` — never a foreign repository) + snapshot `ApplicationFees` onto `PaidFees` (invariant #28) + `ApplicationStatus = New`, `POST`/`GET`(paginated)/`GET :id`/`PATCH :id/cancel`. Remember: `/api/lookup/*` endpoints verified live; boot the API from a fresh `dist` (Rebuild after pulling).

### Session 10 — 2026-08-13
**Completed:** 2.2 — User Management `[UI]` (full 2.2 vertical slice: `/users` route + UsersPage/UsersList DataTable, CreateUserAccountModal with unlinked-people combobox, UpdatePasswordModal, delete confirmation with 409 stay-open; status toggle + password reset wired). **Post-feature refactor (user request): the "Link to Person" combobox extracted into a reusable `SearchableCombobox<T>` at `shared/components/searchable-combobox.tsx`** — the create-user modal now just feeds it (only `personId` is stored in the form; the component receives the full `PersonDto` feed and reports the picked person back up = dropdown + type-to-filter over the full unlinked feed, exactly as served by `GET /people/unlinked`).
**Decisions made:**
- **`PasswordInput` moved from `features/auth/components/` to `shared/components/password-input.tsx` (ARCHITECT call, invariant #13)** — the 2.2 modals need the same masked field as the sign-in form, and a feature must never import from another feature. Same shared/ precedent as AppShell/AuthGuard; auth imports repointed, old file deleted.
- **Combobox feed served by `userService.getUnlinkedPeople()` (route `GET /people/unlinked`)** — the endpoint lives in the people module on the backend, but frontend-wise it exists only for this combobox, so the users feature's own service calls it (no `features/people` import, invariant #13 preserved). Its query key lives in `usersKeys.unlinkedPeople()` and **useCreateUser invalidates it** so a freshly linked person vanishes from the picker.
- **Toggle = wait-for-server (user decision, ARCHITECT)** — no optimistic flip; per-row pending via `togglingId` state (a mutation hook's global `isPending` can't distinguish rows), switch disabled while in flight.
- **(you) tag = informative only (user decision, no self-row guard)** — `useAuthStore` selector compares `user.username`; deactivating/deleting your own account stays enabled (no roles exist to protect, invariant #31).
- **shadcn primitives added via CLI: `switch`, `popover`, `command`** (the CLI also regenerated `button`/`input`/`dialog` and pulled in `textarea` + `input-group` as command deps).
- **Combobox refactored to a shared generic (user request)** — `SearchableCombobox<T>` in `shared/components/` (same placement logic as the shared DataTable): the feature hook feeds the full option set, the component owns open/search/filter + pending/error/empty/no-match states; identity via `getOptionKey` (never reference equality, so a re-fetched array still highlights the pick); search resets on any close so a stale filter never reopens. `create-user-account-modal.tsx` was reduced to props + a `Label`/error wrapper; ui-registry.md Combobox section + table row repointed at the shared file.
- Hooks ship one more than build-plan listed: `useDeleteUser` + `useUnlinkedPeople` (plan named the other four) — both are required by the shipped UI.
**Deviations from plan:** none of substance — hooks set above; ui-registry.md gained two new imprint sections (UserStatusCell pair, Combobox — now updated for the shared component) and its Combobox/ToggleSwitch table rows point at the 2.2 files.
**Known issues / follow-ups:**
- **Still NO live browser/API smoke** (carried, user keeps cancelling) — `/users` table, filter debounce, toggle roundtrip, combobox filter, both modals, delete 409 stay-open, and the first real `JwtStrategy` exercise on a *list* route remain unverified at runtime. `pnpm typecheck` + `pnpm build` green; `/users` in the route table.
- Still owed REVIEWs (AGENTS.md §3.1): 0.B.2, 0.C.1, 1.1, plus re-REVIEWs folded in (2.1 after migration fix, now 2.2 `[UI]` itself).
- 1.2 REVIEW minors unfixed (user choice): Edit-modal dead-weight refetch, data-table location undocumented in architecture.md, `getAge` UTC/local boundary; "unclamped footer Page 2 of 1" edge user-accepted.
- Roles column (1.2 deferred) still pending the Users/Drivers decision point — Users now ships; Drivers still absent.
**Start next session with:** **REVIEW pass on 2.2 `[UI]`** (invariant cross-refs: #1/#4/#5/#6/#12/#13/#31, step comments, a11y per ui-rules — switch+pill pairing, combobox keyboard flow), then **3.1 — Lookup Data `[LOGIC]`**: `LicenseClass`/`ApplicationType`/`TestType` entities + migrations, seed migration with the 7 classes/6 application types/3 test types from `System_Requirments.md`, read-only `findAll` per table, lookup module wiring. After 3.1 REVIEW → 4.1 Local Driving License Applications.

### Session 9 — 2026-08-13
**Completed:** 1.2 `[UI]` REVIEW (label-association fix), 2.1 — User Management `[LOGIC]` (full vertical slice + `GET /people/unlinked`), `UNIQUE(PersonID)` migration run against Supabase
**Decisions made:**
- **`GET /users` is paginated (user directive this session)** — same envelope as `/people` (`PaginatedResultDto`, page/pageSize/search defaults 1/10), search matches username + linked person's name/national number. build-plan 2.1 updated.
- **`UserDto` is flat (user decision)** — `{ id, username, personId, personName, nationalNumber, isActive }`; person display fields denormalized, no nesting. Added to `packages/shared` (invariant #9).
- **Password rules (user decision)** — MinLength 8 / MaxLength 72 (bcrypt byte limit) on create + password change; no complexity regex.
- **DELETE /users/:id = hard delete with 23503→409 guard (user decision)** — everyday login removal stays `PATCH /users/:id/status` (IsActive toggle; JwtStrategy re-checks per request). Both routes live.
- **Users.PersonID got a real UNIQUE constraint (user decision, REVIEW fix)** — `1786620128823-AddUniquePersonIdToUsers.ts` migration **executed against Supabase**; service 409 pre-check is now the friendly path, constraint is the structural guarantee. architecture.md DBML updated (`[unique]` marker).
- **UsersService reaches the people domain through `PeopleService`** (exported from PeopleModule) — person-exists check reuses its 404 semantics; `GET /people/unlinked` lives in PeopleController (`@Get('unlinked')` BEFORE `@Get(':id')` — Session 6 gotcha) with a NOT EXISTS subquery inside PeopleRepository (no foreign entity import).
**Deviations from plan:** none of substance — hard-delete + toggle both per plan; unlinked feed as a route (plan offered route-or-query-param).
**Known issues / follow-ups:**
- **RECOVER fix: `Person.photoUrl` latent boot-blocking bug** — Session 6's `string | null` retype made TypeORM reflection emit `Object` for the column type; `migration:run` and any API boot failed metadata validation with `DataTypeNotSupportedError`. Fixed with explicit `type: 'varchar'` (person.entity.ts). The API had not booted since the retype — this would have hit the first live smoke.
- **Still no live browser/API smoke** — 2.1 endpoints (`GET /users`, `POST /users` 409s, `GET /people/unlinked`) unverified at runtime; first real exercise of JwtStrategy on protected routes still pending. Migration run DID verify data-source metadata + DB connectivity.
- `jwt.strategy.ts` fail-loud dev-secret fallback: verified **already fixed** in current code (refuses to start without JWT_SECRET) — dropped from the carry list.
- 1.2 REVIEW minors NOT fixed (user chose label-association only): Edit-modal refetch doesn't reach the open form (dead-weight refetch), `data-table.tsx` location undocumented in architecture.md, `getAge` UTC/local boundary.
- **Still owed REVIEWs** (AGENTS.md §3.1): 0.B.2, 0.C.1, 1.1, and now 2.1 `[LOGIC]` — 2.1's REVIEW was run and its only Important finding (PersonID uniqueness) resolved; a re-REVIEW after the migration + photoUrl fix is folded into the owed list.
**Start next session with:** **2.2 — User Management `[UI]`** — ARCHITECT first, then: `/users` route + `usersKeys` factory + `userService` (getUsers/createUser/updatePassword/setStatus/deleteUser) + hooks (`useUsers`, `useCreateUser`, `useUpdateUserPassword`, `useSetUserStatus`, `useDeleteUser`), `CreateUserAccountModal` (searchable "Link to Person" combobox fed by `GET /people/unlinked` — ui-registry Combobox pattern: `Name (National-Number)` options, select requires unlinked people only; username + password fields with the shared min-8 rule), `UpdatePasswordModal` (single New Password field + PasswordInput pattern), Status column = `ToggleSwitch` + `StatusPill` pair (Active/Inactive, ui-registry), Actions = Key (reset password) + Trash2 (delete, AlertDialog confirm, 409 message inline). Backend contract: `UserDto` flat (above), 2.1 DTOs already shipped.

### Session 7 — 2026-08-13
**Completed:** 1.2 — People Management `[UI]` (full 1.2 vertical slice: TanStack Query wired app-wide, `/people` route + PeoplePage/PeopleList DataTable, Add/Edit modals, delete confirmation)
**Decisions made:**
- **Roles column SKIPPED in the shipped UI (user decision)** — no `Drivers` table exists yet and no endpoint exposes User/Driver presence, so client-side derivation had no data source. **Deferred**: build-plan.md §1.2 carries a marked note to return when Features 2 (Users) and 9 (Drivers) ship — options are (A) backend-computed `roles` on the people response via EXISTS, or (B) client-side from the new endpoints. Table ships with 5 columns (Person, National No., Age/Gender, Contact, Actions).
- **TanStack Query installed + QueryProvider at root layout** (`shared/providers/query-provider.tsx`) — the app's first real use of invariant #1 (login is client state, so react-query waited for Feature 1, per Session 3 note). Defaults: `staleTime 30s`, `retry 1`; `usePeople` overrides `5min` (registry data, mutations invalidate).
- **`peopleKeys.list(filter)` carries `{ search, page, pageSize }`** per library-docs §4; mutations invalidate `lists()` (create) / `lists()` + `detail(id)` (update/delete; delete also `removeQueries` on the detail).
- **`PaginatedApiResponse<T>` added to `shared/types/api-response.ts`** — meta shape reuses `PaginatedResultDto` from `@repo/shared` (invariant #9, single definition).
- **`getApiErrorMessage` helper in `shared/lib/api-errors.ts`** — extracts the AllExceptionsFilter `message` (string or joined class-validator array) from axios rejections; all three dialogs surface server errors verbatim (e.g. the 409 duplicate National No.).
- **Edit modal seeds the form from the already-fetched row** (`usePerson(id, person)` with `initialData`) — zero loading flash; background refetch keeps it server-fresh. Add form defaults: Gender = Male, Country = "United States" (spec).
- **Country is a curated Select** (`features/people/countries.ts`, ~38 options, US default) — free-text backend value not in the list still displays via the Select trigger.
- **DOB is a native `type="date"` input** — browser picker indicator hidden, single `CalendarIcon` right (spec); avoids adding a date-picker dependency.
- **Modal footer bar uses `bg-background`** (#F8FAFC = the `background` token, per spec) on `border-t`, not the shadcn `bg-muted/50` default.
**Deviations from plan:** Roles column deferred (see above — build-plan updated); ui-registry DataTable/FormModal spec rows now have full imprint sections (first implementation of both patterns).
**Known issues / follow-ups:**
- REVIEW pass on 1.2 `[UI]` not yet run (AGENTS.md §3.1) — plus still-owed REVIEWs: 1.1, 0.B.2, 0.C.1.
- **No live browser smoke test** — `/people` built and static-generated (build green), but the table/filter/dialogs and the first real use of `JwtStrategy` on a protected route remain unverified at runtime.
- `badge.tsx` added via CLI for the deferred RolePill — unused until Roles returns (standard primitive, kept).
- Carried: `jwt.strategy.ts:35` dev-secret fallback decision.
**Start next session with:** REVIEW pass on 1.2 `[UI]` (invariant cross-refs: #1/#4/#5/#6 hooks-services chain, #12 thin pages, #13 no cross-feature imports, a11y per ui-rules, step comments per code-standards §5), then **2.1 — User Management `[LOGIC]`**: `UsersRepository` (joined with Person for display), `CreateUserRequestDto`, `UsersService` (reject a Person that already has a User row; password hash cost 12; toDto never leaks the hash), `UsersController` (`GET /users`, `POST /users`, `PATCH /users/:id/password`, `PATCH /users/:id/status`, `DELETE /users/:id`), plus `GET /people/unlinked` for the 2.2 combobox — declared BEFORE `@Get(':id')` in PeopleController (ParseIntPipe gotcha, Session 6).

### Session 8 — 2026-08-13
**Completed:** DataTable extraction refactor — the STEP 4/5/8 regions (filter bar, table region, footer) of `PeopleList` moved verbatim into a shared generic `apps/web/src/components/data-table.tsx` (`DataTable<T>`), presentational only (no hooks, no state).
**Decisions made:**
- **DataTable is now the shared component the ui-registry always implied** — ui-registry.md registered DataTable as the pattern for People/Users/Applications/Drivers and ruled out a second table component; the PeopleList implementation was the only copy. Future list screens pass `columns` (header + cell renderer + per-column class), `rows`/`getRowId`, query states (`isPending`/`isError`/`onRetry`/`errorMessage`), `empty` node, and search/pagination props.
- **Search + page state stay in the feature component** (PeopleList still owns the 300ms debounce, page-reset-on-commit, and dialog orchestration) — DataTable takes `searchValue`/`onSearchChange`/`total`/`page`/`totalPages`/`onPageChange`. Keeps the shared component presentational; the list's invariants (#1 client vs server state) stay where they were.
- **`colSpan` is now `columns.length`** instead of the hardcoded `5`; empty-state wrapper (`flex flex-col items-center gap-2 py-10 text-center`) moved into DataTable so features pass only icon + copy.
- Error copy stays feature-supplied via `errorMessage` prop ("Could not load the citizen registry."), default "Could not load the data." for future screens.
**Deviations from plan:** none — pure extraction, no behavior or visual change; ui-registry.md DataTable entry updated to the new file path and pattern notes rewritten ("reuse" replaces "copy this layout").
**Known issues / follow-ups:**
- Still owed REVIEWs: 1.2 `[UI]`, 1.1, 0.B.2, 0.C.1 (carried from Session 7) — this refactor adds 1.2 `[UI]` REVIEW surface (`data-table.tsx` + `people-list.tsx`).
- No live browser smoke test yet (carried) — `pnpm typecheck`/`lint` green on the refactor.
**Start next session with:** REVIEW pass on 1.2 `[UI]` (now including the shared `DataTable` component), then **2.1 — User Management `[LOGIC]`** exactly as queued in Session 7 (UsersRepository joined with Person, CreateUserRequestDto, UsersService with existing-User rejection + hash cost 12, UsersController CRUD + password/status patches, `GET /people/unlinked` BEFORE `@Get(':id')`).

### Session 6 — 2026-08-13
**Completed:** 1.1 — People Management `[LOGIC]` (full CRUD vertical slice: shared `PersonDto`, create/update request DTOs, `PeopleRepository`, `PeopleService`, `PeopleController`, module wiring)
**Decisions made:**
- **True PATCH semantics for `PATCH /people/:id` (user decision, overrode the initial full-field-replace proposal)** — every `UpdatePersonRequestDto` field is optional; only fields present in the body are validated and applied; the National Number uniqueness re-check runs only when `nationalNumber` is present in the body, self-excluded.
- **Delete = hard delete blocked by any child FK, never cascade (user-confirmed policy)** — `remove()` catches Postgres `23503` (foreign_key_violation) → 409 "linked records exist". The catch auto-covers Users today and Drivers/Applications later with zero code changes. Cascading business/audit records would violate the permanence invariants (#20-21 locked appointments, #26 deactivation-not-deletion, #27 release paper trail, #28 fee snapshots); login removal belongs to `Users.IsActive = false` (Feature 2.1), not People deletion.
- **Single `search` query param** (free-text, case-insensitive LOWER/LIKE over firstName/lastName/nationalNumber/email/phone), list envelope `{ success, data, meta: { total, page, pageSize } }`, defaults page=1 pageSize=10, `ORDER BY PersonID DESC` (newest first). Matches 1.2's single DataTable filter input and library-docs §4's `list(filter)` key-factory shape.
- **`@ValidateIf(v => v !== undefined)` instead of `@IsOptional()`** on update fields — IsOptional lets `null` through to NOT NULL columns (500); ValidateIf skips only `undefined` so the type validator rejects `null` as a clean 400. `photoUrl` is the deliberate exception (null clears the nullable column, handled manually in `update()` because TypeORM's `merge` DeepPartial rejects `string | null`).
- **`Person.photoUrl` retyped `string | null`** (truthful for the nullable column); `PersonDto.photoUrl` stays `?: string` — `toDto` normalizes with `?? undefined`.
- **No migration for 1.1** — the People table already shipped in the 0.B migration (Session 2); the "Person entity + migration" checklist item was satisfied then. No audit columns on People (invariant #29 covers licensing/enforcement mutations only).
**Deviations from plan:** none of substance — no new migration (see above); build-plan's update path was written full-replace, overridden by the PATCH decision above (memory.md + DTO comments document it).
**Known issues / follow-ups:**
- REVIEW pass on 1.1 not yet run (AGENTS.md §3.1 mandates it before the paired 1.2 UI starts).
- **Live smoke test cancelled by user decision** — endpoints unverified at runtime; first real exercise of `JwtStrategy` on protected routes when tested.
- Carried from earlier: REVIEW 0.B.2 + 0.C.1, browser smoke tests of 0.B.2/0.C.1, `jwt.strategy.ts:35` `?? 'dev-only-secret'` fail-loud decision.
- `users.repository.ts:15` queryRunner-to-super deprecation: verified **already fixed** in current code (comment documents the omission) — dropped from the carry list.
- Gotcha for 2.1: any static route added to PeopleController (e.g. `GET /people/unlinked`) must be declared BEFORE `@Get(':id')` or ParseIntPipe will 400 it.
**Start next session with:** REVIEW pass on 1.1 `[LOGIC]` (step comments per code-standards §5, toDto gate everywhere, 23503→409 delete path, self-exempt dup check on update), then **1.2 — People Management `[UI]`**: ARCHITECT first; install `react-hook-form` + `zod` + `@hookform/resolvers` into `apps/web` only (never `packages/shared`); `features/people/` — `peopleKeys` factory, `personService` via apiClient, `usePeople`/`usePerson`/`useCreatePerson`/`useUpdatePerson`/`useDeletePerson`; `/people` page — `PeopleList` DataTable (filter input; Person, National No., Age/Gender, Contact, Roles, Actions columns), Roles pills derived client-side from related User/Driver presence (read-only display — no endpoint carries it), `AddPersonModal`/`EditPersonModal` (shadcn Dialog, zod schema mirroring the backend DTO incl. `N-\d{8}`), delete confirmation destructive style.

### Session 5 — 2026-08-12
**Completed:** 0.C.1 — Application Shell & Navigation `[UI]` (full AppShell frame: sidebar + topbar + content slot)
**Decisions made:**
- **Custom AppShell + Zustand chrome store, not the shadcn `sidebar` primitive** — library-docs §5 designates sidebar open/closed as `ui.store.ts`'s concern; ui-registry defines `AppShell`/`SidebarNavItem` as custom components on `Button ghost`. New primitives added via CLI instead: `avatar`, `sheet`, `tooltip`.
- **`useUiStore` (sidebarCollapsed/toggleSidebar) in `shared/stores/`**, deliberately **unpersisted** per library-docs §5 — sidebar resets to expanded on every load. Mobile drawer open state is local state in `AppShell` (only trigger + drawer read it, no cross-component need).
- **Shell lives in `src/shared/components/app-shell/`** (`app-shell`, `sidebar-navigation`, `sidebar-nav-item`, `top-bar`, `nav-config`) — cross-feature chrome like `AuthGuard`, respecting invariant #13. `(protected)/layout.tsx` = `AuthGuard > AppShell > {children}`.
- **Desktop collapse = icon rail (288px ↔ 64px) with Tooltips; mobile = Sheet off-canvas drawer** (ui-rules: never push content; Sheet provides focus trap/Escape/backdrop per ui-rules accessibility) — `md` breakpoint switches. (288px, not 264px, so the "DVLD Licensing Department" wordmark renders untruncated on one line.)
- **Active-route = exact match OR deeper path within a section** (`/applications/local/[id]` lights `/applications/local`) so future detail pages stay highlighted; only `/dashboard` is reachable today.
- **All four nav groups render now** (routes 404 until their features land) — nav is fixed product chrome per project-overview § Pages & Navigation.
- **`TooltipProvider` moved to root `layout.tsx`** — ui tooltips portal to body; a provider nested in a route layout would miss Sheet/portal'd content.
- **Dashboard placeholder simplified** — shell owns the frame now; the page centers its card in the content slot (`min-h-[calc(100dvh-7rem)]`, bg/padding removed). Unchanged otherwise until 12.2.
- **Avatar initials derived from `fullName`** (first letters of first two words → `SA`), fallback username; username text hidden below `sm`.
**Deviations from plan:** none of substance — quick-search stays a decorative input per build-plan (no wiring); bell is decorative (no notifications system exists); `ui-registry.md`'s AppShell/SidebarNavItem/TopBar rows updated + three new imprint sections added (SidebarNavItem, SidebarNavigation, TopBar).
**Known issues / follow-ups:**
- REVIEW pass on 0.C.1 not yet run (mandated post-UI by AGENTS.md §3.1) — plus the still-owed 0.B.2 REVIEW and browser smoke test of both features (login at `/`, guard redirect, shell render/collapse/drawer, sign-out loop).
- 0.B.1 minors still unfixed (carried): `jwt.strategy.ts:35` `?? 'dev-only-secret'` fallback (fail-loud recommended), `users.repository.ts:15` deprecated `queryRunner` arg to `super()`.
- `@types/bcryptjs` note: verified `pnpm typecheck` + `pnpm build` green; `/` and `/dashboard` return 200 on the built server. Shell markup is intentionally absent from the `/dashboard` SSR HTML — `AuthGuard` renders nothing until hydration (0.B.2 design), so the shell only appears client-side after login; the manual browser pass remains the real verification.
**Start next session with:** Browser smoke test of 0.B.2 + 0.C.1 together (both demo accounts → shell renders with sidebar/topbar; collapse toggle → icon rail; viewport <md → drawer; nav pills; sign-out loop), then REVIEW passes on 0.B.2 and 0.C.1, then **1.1 — People Management `[LOGIC]`** (Person entity exists from 0.B; add CRUD endpoints + `CreatePersonRequestDto`/`UpdatePersonRequestDto`, `PeopleRepository`, `PeopleService` with 409 on duplicate national number, `PeopleController`).

### Session 4 — 2026-08-12
**Completed:** Route rework of 0.B.2 (login now at `/`, protected landing at `/dashboard`); decision note for form tooling added to `library-docs.md § 9`, `code-standards.md § 7`, `build-plan.md`.
**Decisions made:**
- **Route swap (user decision):** the auth/login page lives at `/` (was `/login`; `/login/page.tsx` deleted, root `page.tsx` now composes `AuthSplitScreen`) and the dashboard lands at `/dashboard` (the old `(protected)/auth` placeholder moved to `(protected)/dashboard/page.tsx`). All redirects updated: `AuthGuard` → `/`, `api-client` 401 interceptor → `/`, `useLogin` → `/dashboard`. This *reverses* Session 3's "login → `/auth`, dashboard on `/`" decision (that plan predates 0.C; see line 98 below for the superseded call).
- **react-hook-form + zod for form-heavy features (user decision):** from Feature 1.2 onward, any feature that needs a form (create/edit modals, appointment scheduling, issuance/renewal confirmations) uses `react-hook-form` + `zod` + `@hookform/resolvers`. **The sign-in form is explicitly excluded** — it's a simple two-field form, stays plain `useState`, and is not to be retrofitted. Pattern + rules: `library-docs.md § 9`; conventions: `code-standards.md § 7`; feature note: `build-plan.md` "How to use this file".
- Packages NOT installed yet — the note is a forward contract; dependencies are added in `apps/web` when the first form-bearing feature (1.2) starts. `packages/shared` stays zero-runtime-deps (no zod there).
**Deviations from plan:** route layout differs from `build-plan.md`'s original `/login` wording for 0.B.2 — build-plan updated to match the new `/` route.
**Known issues / follow-ups:**
- Browser smoke test of the new routes still owed (login at `/`, post-login landing at `/dashboard`, guard redirect + sign-out loop).
- REVIEW pass on 0.B.2 still not run (carried from Session 3).
- 0.B.1 minors carried: `jwt.strategy.ts:35` dev fallback, `users.repository.ts:15` queryRunner-to-super deprecation.
**Start next session with:** Browser smoke test of the moved routes (both demo accounts at `/`, wrong-password inline error, redirect to `/dashboard`, sign-out back to `/`), then REVIEW pass on 0.B.2, then **0.C.1 — Application Shell & Navigation `[UI]`**: `DashboardLayout` (sidebar w/ 4 nav groups from `project-overview.md § Pages & Navigation`, active-route pill, topbar) wrapping the `/dashboard` landing.

### Session 3 — 2026-08-12
**Completed:** 0.B.2 — Authentication `[UI]` (full vertical slice of the login UX: page, components, store, guard, api client)
**Decisions made:**
- **Post-login landing is `/auth` (user decision), dashboard on `/` in 0.C** — `/auth` is a minimal protected placeholder ("Signed in as …" + Sign out) that exercises AuthGuard + the store roundtrip; 0.C builds the real AppShell on `/`.
- **Feature bullets use circular green checkmarks** (`bg-success/90` circle + white `CircleCheck`), per the user's descriptive prompt — deviates from ui-registry's earlier `ShieldCheck` note; `ui-registry.md` updated to match.
- **`useAuthStore` lives in `apps/web/src/shared/stores/`** (not `features/auth/store/`) because apiClient, AuthGuard, login, and (later) the TopBar all read it — it's shared cross-feature infrastructure, and `features/` must not import from other features (invariant #13).
- **`ApiResponse<T>` envelope type added to `shared/types/`** — services unwrap `{ success, data }`; errors shape server-side and never get typed.
- **Root `layout.tsx` fixed**: removed the Geist font that was shadowing `--font-sans`; only Inter (`--font-inter`) + JetBrains Mono (`--font-jetbrains-mono`) load, per `ui-tokens.md`.
- **No TanStack Query for login** — the login POST's result *is* the client session (Zustand client state, invariant #1 / library-docs §5), not cacheable server data; react-query enters with Feature 1.
- **Shadcn primitives generated via CLI** (`button`, `input`, `label`, `card`) — the first `components/ui/*` files in the repo; generated untouched per code-standards.

**Deviations from plan:** none of substance — `DemoAccountsCard` gate uses `process.env.NODE_ENV !== "production"` (build-plan's first-listed option; no `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` flag added). `AuthGuard` lives in `shared/providers/` rather than under the auth feature for the same cross-feature reason as the store.
**Known issues / follow-ups:**
- **REVIEW pass on 0.B.2 not yet run** (AGENTS.md §3.1 mandates it post-UI) — run before starting 0.C.1.
- 0.B.1 REVIEW found 2 minors (already documented, still unfixed): `jwt.strategy.ts:35` `?? 'dev-only-secret'` fallback (asymmetric with JwtModule sign secret — fail-loud recommended) and `users.repository.ts:15` passing `queryRunner` to `super()` (deprecated, boot warning).
- Live smoke test: API logins verified working (admin → token + user json), but the **web UI itself was not browser-tested** — AuthGuard redirect, sign-in form submit, and the 401 interceptor path need a manual browser pass (dev servers were started and killed cleanly by PID).
- Dev servers were started for the smoke test and shut down by PID — no stray node processes left running.

**Start next session with:** Browser smoke test of `/login` (both demo accounts, wrong-password error, guard redirect to `/auth`, sign-out), then REVIEW pass on 0.B.2, then **0.C.1 — Application Shell & Navigation `[UI]`**: `DashboardLayout` (sidebar w/ 4 nav groups from `project-overview.md § Pages & Navigation`, active-route pill, topbar with quick search + bell + avatar/username from `useAuthStore`).

### Session 2 — 2026-08-12
**Completed:** 0.B.1 — Authentication `[LOGIC]`
**Decisions made:**
- **`Person` entity created ahead of Feature 1 (schema-only)** — 0.B's seed
  needs the `PersonID` FK and the login response needs `personId`/`fullName`,
  so `modules/people/entities/person.entity.ts` + migration shipped now; no
  CRUD endpoints/DTOs — Feature 1.1 adds those on top.
- **bcryptjs instead of `bcrypt`** — identical API (hash/compare, cost 12),
  pure JS, no node-gyp on Windows; library-docs §3 examples still valid.
- **Schema via CLI-generated migration, seed data via direct SQL (user
  decision)** — schema as `1786534301863-CreatePeopleAndUsers.ts` migration
  (invariant #17 preserved), demo accounts inserted directly into Supabase
  (NOT a migration file) per user preference.
- **Demo accounts:** `admin` / `Admin@123` (Person: System Administrator,
  N-10000001) and `r.sabbagh` / `Sabbagh@123` (Person: Razan Sabbagh,
  N-10000002) — plaintext shown only by the 0.B.2 dev-only card; DB stores
  nothing but bcrypt hashes (cost 12).
- **JwtStrategy re-checks the DB per request** (account still exists +
  `IsActive`) so deactivation takes effect immediately, not at token expiry.
- **Migration scripts switched to `typeorm-ts-node-commonjs` bin**: the bare
  `typeorm` bin fails loading the CLI under Node 22 (ESM syntax error);
  commonjs bin verified working. (`pnpm typeorm`/`migration:generate`/`run`/`revert`).

**Deviations from plan:** none of substance — see Person-entity and
bcryptjs decisions above. Seed row insertion via direct SQL per user request
instead of build-plan's "seed migration".
**Known issues / follow-ups:**
- `@types/bcryptjs` was added then removed — bcryptjs 3.x ships its own types.
- Guard+strategy end-to-end not exercised on a protected route yet — no
  protected controller existed at 0.B.1 (login + health are public); first
  protected endpoint (Feature 1) will exercise `JwtStrategy.validate()`.
- Supabase advisor flags RLS disabled on `People`/`Users`/`migrations` —
  N/A for this architecture: the NestJS backend connects with the postgres
  role (bypasses RLS), browser never talks to Postgres directly. No action.
- RUNTIME NOTE: the smoke-test teardown killed ALL node processes on the machine
  (broad `Stop-Process -Name node`), not just the API dev server — check for
  collateral damage to other local dev servers before starting anything new.
- `JWT_SECRET` is now a real long value in `apps/api/.env` (set by user).

**Start next session with:** 0.B.1 was verified live (both logins → token +
joined fullName/personId; wrong password → 401; health public OK). Next:
**0.B.2 — Auth `[UI]`**: ARCHITECT → `/login` split screen, `PasswordInput`,
`DemoAccountsCard` (dev-only gate), `useAuthStore` (Zustand persist),
`AuthGuard` wrapper for the `(protected)` group, `apiClient` axios
interceptors (attach token; clear+redirect on 401).

### Session 1 — 2026-08-12
**Completed:** 0.A — Monorepo, Database & Shared Package Scaffold `[LOGIC]`
**Decisions made:**
- Supabase project `dvld` created in Y-ZER0's Org, eu-central-1, free tier
  (project ref `tvpphretcytcicjnduxg`, `ACTIVE_HEALTHY`). DB password not
  retrievable via MCP — user must supply it from the dashboard.
- TypeORM pinned to `0.3.31` (the `legacy` tag) rather than the new 1.x major —
  every migration/DataSource pattern in `library-docs.md` § 1 is written
  against the 0.3 API, and upgrading to a major the docs don't cover is a
  deliberate decision, not a scaffold accident.
- Next.js pinned to the 15.x stable line (15.5.23) — knowledge-base patterns
  (App Router, Tailwind v4 globals) are aligned with it; 16.x not adopted.
- Ports: API 4000 (`/api` global prefix), web 3000.
- `packages/shared` is a **compiled** package (tsc → `dist/`, `main`/`types`
  point there) consumed as a normal workspace dependency — avoids NestJS
  rootDir and Next transpilePackages complications. "Zero runtime deps" is
  preserved; turbo `^build` orders the build.
- shadcn base: Radix (`--base radix --preset nova` — the new shadcn-4 CLI
  names differ from `library-docs.md` § 7's `new-york`/`-b` flags; output is
  the unified `radix-ui` package + `shadcn` dep).
- `sharp` build script approved via `pnpm.onlyBuiltDependencies` in root
  package.json (pnpm 10 blocks postinstall by default).

**Deviations from plan:** none — scope stayed within the 0.A.1 checklist.
Minor doc drift flagged in REVIEW: `apps/web/components.json` carries
`"style": "radix-nova"` instead of the `new-york` value in `library-docs.md`
§ 7 — unavoidable with the current shadcn CLI; noted, not fixed.
**Known issues / follow-ups:**
- `apps/api/.env` has a `[PASSWORD]` placeholder in both URLs. Migration
  tooling was verified end-to-end against the direct URL (reached Supabase
  auth, failed `28P01` on the placeholder password only). User must paste the
  DB password; then test `pnpm migration:run` + boot the API.
- `JWT_SECRET` in `apps/api/.env` is a placeholder — set a real secret (≥32
  chars) before/with 0.B auth work.
- `AllExceptionsFilter`'s 500 branch does not surface the underlying error in
  the response body — deliberate (no raw stack traces to clients); keep
  server-side logging in mind when debugging.
**Start next session with:** 0.B.1 — Authentication `[LOGIC]` (auth module,
login endpoint, JWT strategy/guards, `@Public`/`@CurrentUser` decorators, seed
migration for demo users `admin` / `r.sabbagh`), AFTER the user supplies the
real DB password and the connection is confirmed working.
