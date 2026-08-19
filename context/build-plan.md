# build-plan.md

## How to use this file

Every feature below is split into a `[LOGIC]` sub-task and a `[UI]` sub-task.
**Do not start a `[UI]` sub-task until its paired `[LOGIC]` sub-task is
complete and REVIEW has signed off** (`AGENTS.md § 3.1`). Completion status
is tracked in `progress-tracker.md` — this file is the plan, not the tracker.

Each feature opens with a **"Before you build this" walkthrough** — a
plain-language explanation of what the feature does and why, written for
someone who has never seen the screens. Read it before invoking ARCHITECT.

**Forms note (applies from Feature 1.2 onwards):** any feature that needs a
form (create/edit modals, scheduling, issuance confirmations - not the
sign-in form, which stays plain `useState` and is excluded by decision)
is built with **react-hook-form + zod** (`@hookform/resolvers`). Schemas are
colocated with the form component; rules mirror the backend DTO. See
`library-docs.md § 9` / `code-standards.md § 7` before writing a form.

---

# Phase 0 — Foundation Setup

## Feature 0.A: Monorepo, Database & Shared Package Scaffold

**Before you build this:** Nothing else in this plan can start until the repo
itself exists. This sets up the pnpm workspace, connects to Supabase, and
creates the `packages/shared` folder where every DTO and enum in the whole
system will eventually live. There is no UI for this feature — it's pure
plumbing.

### 0.A.1 — [LOGIC]
- `pnpm-workspace.yaml`, root `package.json`, `turbo.json`
- `apps/api` NestJS scaffold, `apps/web` Next.js (App Router) scaffold
- `packages/shared` with empty `dtos/`, `enums/`, `index.ts` barrel
- TypeORM `DataSource` wired to Supabase via `DATABASE_URL`, SSL enabled
- Global `ValidationPipe`, `AllExceptionsFilter`, CORS configured in `main.ts`
- Migration tooling wired to `DATABASE_MIGRATION_URL`
- `AllExceptionsFilter` returns the standard `{ success, statusCode, message, path, timestamp }` shape

*(No `[UI]` sub-task — this feature has no screen.)*

## Feature 0.B: Authentication

**Before you build this:** Every other screen in this app sits behind a
login. A department employee enters a username/password (tied to their
`Users` row, which is tied to their `People` row); on success they get a
token that the rest of the app quietly attaches to every request. There is
no admin tier — the login response carries no role/permission field
(architecture.md invariant #31), and the top-right avatar badge simply shows
whichever username signed in.

### 0.B.1 — [LOGIC]
- `User` entity (`select: false` on password column)
- `AuthModule`: `POST /api/auth/login` (validates via bcrypt, issues JWT)
- `JwtStrategy`, `JwtAuthGuard`, `@Public()` decorator, `@CurrentUser()` decorator
- Apply `JwtAuthGuard` globally; every controller below is protected by default
- Seed migration: two demo `Users` (e.g. `admin` / `r.sabbagh`), each
      linked to a seeded `Person` row — this is what the frontend's "Demo
      accounts" helper will read/display in non-production environments

### 0.B.2 — [UI]
- `/` page (login) — two-column split screen:
  - Left panel (`bg-sidebar` token, dark, hidden below `lg`): logo/wordmark
    top-left, product headline ("Driver & Vehicle Licensing Portal"), a
    one-line description, and 3 feature bullets each with a shield-check
    icon (e.g. "Sequential test enforcement", "Real-time license lifecycle",
    "Detain and release control")
  - Right panel (white): "Sign in" heading + one-line muted subtext,
    `Username` field (person icon), `Password` field (lock icon + an
    eye/eye-off visibility toggle), full-width primary `Sign in` button
- `PasswordInput` component (shadcn `Input` + toggle button) — see `ui-registry.md`
- `DemoAccountsCard` — small card below the form listing seeded demo
      credentials (username, an informal descriptive label, password) for
      convenience. **This card is dev/staging-only** — gate it behind
      `process.env.NODE_ENV !== 'production'` (or an explicit `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS`
      flag); never ship visible plaintext demo passwords to a production build.
      The descriptive label next to each demo username (e.g. "Administrator",
      "Licensing Officer") is hardcoded copy in this component only — it is
      not read from, or written to, any database column.
- `useAuthStore` (Zustand + `persist`) — token, user, `setAuth`, `clearAuth`
- `AuthGuard` wrapper for the `(protected)` route group
- `apiClient` axios instance with request/response interceptors (attach token, clear+redirect on 401)

## Feature 0.C: Application Shell & Navigation

**Before you build this:** This is the persistent frame every other feature
renders inside — the dark left sidebar with its four grouped sections
(Overview / Registry / Applications Hub / Operations), the top bar with quick
search, notification bell, and account badge. It has no data of its own to
fetch beyond the already-authenticated user, so it is UI-only.

### 0.C.1 — [UI] *(no paired LOGIC sub-task — consumes 0.B's auth session only)*
- `DashboardLayout` — sidebar (nav groups below) + topbar + content slot
- Sidebar nav groups exactly as specified in `project-overview.md § Pages & Navigation`
- Active-route highlighting (filled pill, matches `ui-registry.md`)
- Topbar: quick-search input (non-functional placeholder acceptable until a feature wires it), notification bell, account avatar + username, showing the current session user from `useAuthStore`

---

# Phase 1 — Foundation

## Feature 1: People Management

**Before you build this:** This is the citizen registry — the root record
everything else hangs off of. A clerk can search/filter citizens, add a new
one (with a validated National Number, e.g. `N-10234567`), and edit or delete
an existing one. Every other entity in the system (`Users`, `Drivers`,
`Applications`) points back to a `People` row, so this has to exist and be
solid before anything downstream is built.

### 1.1 — [LOGIC]
- `Person` entity + migration
- `CreatePersonRequestDto` / `UpdatePersonRequestDto` with National Number
      format validator (`library-docs.md § 2`)
- `PeopleRepository`: `findAll` (paginated + filterable by name/national
      number/email/phone), `findById`, `findByNationalNumber`, `create`, `update`, `remove`
- `PeopleService`: duplicate National Number → `409`; `toDto()` gate
- `PeopleController`: `GET /people`, `GET /people/:id`, `POST /people`,
      `PATCH /people/:id`, `DELETE /people/:id`

### 1.2 — [UI]
- `/people` page — `PeopleList` (filter input, table: Person, National
      No., Age/Gender, Contact, Roles, Actions)
- "Roles" column derived client-side from related User/Driver presence
      (read-only display, not stored on `Person`) — **DEFERRED (Session 7
      decision):** the column was removed from the shipped 1.2 UI. There is
      no `Drivers` table yet (no entity/migration) and no endpoint exposes
      User/Driver presence, so client-side derivation has no data source.
      **Return to this when Features 2 (Users) and 9 (Drivers) ship** — the
      original two options: (A) add `roles`/presence info to the people
      response via EXISTS subqueries, or (B) derive client-side from the
      new `/users` + `/drivers` endpoints. The person DTO's field set stays
      fixed either way — the derived-not-stored rule is a read-time concern,
      never a stored `roles` column.
- `AddPersonModal` / `EditPersonModal` (shadcn `Dialog`, form fields per
      screen: National Number, First/Last Name, DOB, Gender, Address, Phone,
      Email, Country)
- Delete confirmation (destructive button style)
- `usePeople`, `usePerson`, `useCreatePerson`, `useUpdatePerson`,
      `useDeletePerson` hooks + `peopleKeys` factory

## Feature 2: User Management

**Before you build this:** This links a citizen to a system login. A clerk
picks an existing `Person` who doesn't already have an account, gives them a
username + password, and can later reset that password or toggle their
account active/inactive. This is a thin layer on top of Feature 1 — build it
second for exactly that reason.

### 2.1 — [LOGIC]
- `UsersRepository`: `findAll` (paginated, joined with `Person` for
      display, searchable across username/person name/national number),
      `findByUsername` (with password, for auth only), `create`,
      `updatePassword`, `setActive`, `remove` — plus `findByUsername` /
      `findByPersonId` uniqueness guards (Session 9: `GET /users` is
      **paginated** per user directive)
- `CreateUserRequestDto` (personId, username, password — hashed in
      service; password MinLength 8 / MaxLength 72, user decision)
- `UsersService`: reject linking a `Person` who already has a `User`
      row (409); `toDto()` never includes the password hash — flat
      `UserDto` (`id`, `username`, `personId`, `personName`,
      `nationalNumber`, `isActive`), Session 9 decision
- `UsersController`: `GET /users` (paginated + searchable),
      `POST /users`, `PATCH /users/:id/password`,
      `PATCH /users/:id/status`, `DELETE /users/:id` (hard delete, 409 on
      FK references — both mechanisms, user decision)
- `GET /people/unlinked` (declared before `@Get(':id')`; NOT EXISTS
      subquery, plain array for the combobox) — powers the "Link to
      Person" picker: only people without a `User` row
- Migration `1786620128823` — `UNIQUE ("PersonID")` on `Users` (2.1
      REVIEW fix; DBML in architecture.md updated to match)

### 2.2 — [UI]
- `/users` page — table: Username, Linked Person, National No., Status
      (toggle), Actions (reset password key icon, delete)
- `CreateUserAccountModal` — searchable "Link to Person" combobox (only
      unlinked people), Username, Password fields
- `UpdatePasswordModal` — single "New Password" field
- Active/Inactive toggle wired to `useSetUserStatus` mutation
- `useUsers`, `useCreateUser`, `useUpdateUserPassword`, `useSetUserStatus` hooks

## Feature 3: Lookup Data

**Before you build this:** `LicenseClasses`, `ApplicationTypes`, and
`TestTypes` are the configuration tables that drive every dropdown and fee
calculation in the rest of the app (minimum ages, test order, fees). At this
phase they only need to **exist and be seeded** with the values below —
there is no editing screen yet (that's Feature 11, later, once there's
something real to configure against). This is why this feature is
**logic-only for now**.

### 3.1 — [LOGIC]
- `LicenseClass`, `ApplicationType`, `TestType` entities + migrations
- Seed migration with the values from `System_Requirments.md`:
  - License Classes: Small Motorcycle (16, 10yr, $25), Heavy Motorcycle (18,
    10yr, $25), Ordinary Driving License/Car (18, 10yr, $35), Commercial/Taxi
    (21, 5yr, $50), Agricultural (18, 10yr, $30), Medium Truck (21, 5yr, $70),
    Heavy Truck (21, 5yr, $100)
  - Application Types: New Local ($15), Renew ($10), Replace Damaged ($5),
    Replace Lost ($10), Release Detained ($20), New International ($50)
  - Test Types: Vision ($10), Written ($20), Street ($25)
- Read-only repository methods (`findAll` per table) — no update/delete
      yet, those arrive with Feature 11

*(No `[UI]` sub-task yet — see Feature 11.)*

---

# Phase 2 — Application Lifecycle & Testing

## Feature 4: Local Driving License Applications

**Before you build this:** A clerk files a new application on behalf of a
citizen: pick the person, pick a license class (the dropdown shows each
class's minimum age inline). The system checks the applicant meets that
class's minimum age, charges the application fee, and creates the
application in "New" status. This also needs a list screen and a detail
screen (the detail screen is where Features 5 and 6 will later attach the
test pipeline and issuance UI — build the shell here, they plug into it).

### 4.1 — [LOGIC]
- `Application` entity (generic, shared later by renewals/international/
      release applications) + `LocalDrivingLicenseApplication` entity + migrations
- `CreateLocalLicenseApplicationRequestDto` (personId, licenseClassId)
- Service: verify applicant age ≥ `LicenseClasses.MinimumAllowedAge`
      (`library-docs.md § 2`); snapshot `ApplicationFees` onto `PaidFees`
      (invariant #28); set `ApplicationStatus = New`
- `POST /local-license-applications`, `GET /local-license-applications`
      (paginated, filterable), `GET /local-license-applications/:id`
      (includes applicant summary — used by the detail page)
- `PATCH /local-license-applications/:id/cancel` (sets `ApplicationStatus = Cancelled`)

### 4.2 — [UI]
- `/applications/local` page — table: App No., Applicant, Class, Test
      Progress (`x/3`), Status pill, Manage → Open
- `NewLocalApplicationModal` — citizen combobox, license class select
      (each option shows `(Min age N)`), fee notice text
- `/applications/local/[id]` detail page shell — two-column layout: left
      Applicant summary card (status, class, fees, action button — Feature 6
      wires the button), right Test Pipeline card (Feature 5 fills this in)
- "Cancel Application" action (destructive, top-right)
- `useLocalLicenseApplications`, `useLocalLicenseApplication`,
      `useCreateLocalLicenseApplication`, `useCancelApplication` hooks

## Feature 5: Test Appointment & Results System

**Before you build this:** This is the core sequencing logic of the whole
system. Each application has exactly three test stages in a fixed order —
Vision, then Written, then Street. A clerk schedules an appointment for
whichever stage is next, then later records Pass or Fail. The moment a
result is recorded, that appointment is frozen forever (locked) — even a
failed one. Failing doesn't let you retry the same appointment; it forces a
brand-new one at the same stage. The next stage only becomes available once
the current one shows Passed. Build this fully before touching Feature 6 —
issuance depends entirely on this feature's state.

### 5.1 — [LOGIC]
- `TestAppointment`, `Test` entities + migrations
- `ScheduleTestAppointmentRequestDto` (testTypeId, appointmentDate)
- Service: reject scheduling a stage whose predecessor hasn't Passed
      (invariant #19); snapshot `TestTypeFees` onto `PaidFees`
- `RecordTestResultRequestDto` (result: passed/failed, notes)
- Service `recordResult()`: reject if `IsLocked = true` (invariant #20);
      write the `Test` row; set `IsLocked = true`; never allow editing a
      locked appointment (invariant #20, #21) — see the full worked example
      in `code-standards.md § 5`
- Endpoint to compute pipeline state for a given application (stage 1/2/3
      status, current appointment, appointment history) — powers the whole
      right-hand column of the detail page
- `POST /test-appointments`, `PATCH /test-appointments/:id/result`

### 5.2 — [UI]
- `TestPipelineCard` — three-row stepper (numbered circle → green check
      once Passed), each row shows fee + description, right side shows either
      "Locked", "Schedule", "Scheduled <date> + Record Result", or "Passed"
      depending on state
- `ScheduleAppointmentModal` — date field, fee notice
- `RecordResultModal` — Result select (Passed/Failed), Examiner Notes
      textarea, explicit warning text: "Saving a result permanently locks
      this appointment. A failed test requires a new appointment."
- `AppointmentHistoryList` — every past appointment for this application,
      newest first, each row showing fee + Passed/Failed/Pending pill + Locked badge
- `useScheduleTestAppointment`, `useRecordTestResult` hooks, both
      invalidating the application detail query key on success

## Feature 6: License Issuance

**Before you build this:** Once all three tests show Passed, the clerk can
issue the license. If this is the person's first license ever, a `Drivers`
record is created for them automatically as part of the exact same
transaction — there should never be a moment where a License exists but its
Driver doesn't (or vice versa). The license fee is charged, and the
expiration date is computed from the license class's validity length.

### 6.1 — [LOGIC]
- `License` entity + migration
- `IssueLicenseRequestDto` (notes, optional)
- Service `issueLicense()`, wrapped in a DB transaction:
  1. re-verify all three `TestType` stages show Passed (server-side,
     invariant #22 — never trust the UI having disabled the button)
  2. find-or-create the `Drivers` row for this applicant (invariant #23)
  3. snapshot `ClassFees` onto `PaidFees`; compute `ExpirationDate =
     IssueDate + DefaultValidityLength years` (`library-docs.md § 8`)
  4. set `IssueReason = FirstTime`; mark the `Application` as `Completed`
- `POST /local-license-applications/:id/issue-license`

### 6.2 — [UI]
- "Issue License" button on the application detail page — disabled with
      the label "Issue License (pass all tests first)" until pipeline state
      shows all three stages Passed, then becomes an active primary button
- `IssueLicenseModal` — summary text (class, applicant, fee), Notes
      textarea, confirm button
- Success state on the detail page: replace the button with an inline
      confirmation card ("License LIC-N issued — Valid <issue> to <expiry>")
- `useIssueLicense` hook, invalidating both the application detail and
      the drivers list query keys on success

---

# Phase 3 — Advanced License Services

## Feature 7: License Renewal & Replacement

**Before you build this:** This screen is a flat register of every local
license on file, not a picker-driven form — a clerk scans the table and acts
directly on the row they need via three per-row buttons: Renew, Damaged
(replacement), Lost (replacement). In every case, the old `Licenses` row is
deactivated as part of issuing the new one — a driver must never end up
holding two active licenses of the same class at once. A license that's
currently detained and not yet released cannot be touched here at all — its
three action buttons render disabled until it's released via Feature 9.

### 7.1 — [LOGIC]
- `RenewalReplacementRequestDto` (existingLicenseId, reason: renew |
      damaged | lost) — `driverId` is derived server-side from the license
      row, not taken from the client
- Service, transactional: verify `existingLicenseId` is currently
      `IsActive`; **reject with 409 if the license has an open
      (`IsReleased = false`) `DetainedLicenses` row** (invariant #32); create
      the corresponding `Application` (`ApplicationTypeID` matched to reason)
      with its `ApplicationFees` snapshotted; set old `Licenses.IsActive =
      false`; create new `Licenses` row with `IssueReason` set accordingly
      and its own fee snapshot (invariant #26)
- `GET /licenses/register` — every local license, joined with driver
      name, class, and a computed `isDetained` flag (used to disable the row's
      actions client-side, in addition to the server-side 409 guard)
- `POST /licenses/:id/renew`, `POST /licenses/:id/replace` (body carries
      the `damaged | lost` reason)

### 7.2 — [UI]
- `/applications/renewals` page — page description: "Issuing a renewal
      or replacement automatically deactivates the previous license."
- `LicenseRegisterTable` — columns: License (`#N`), Driver, Class,
      Issued, Expires, Reason (prior `IssueReason`), Status (Active/Detained
      pill), Actions (three buttons: Renew — refresh icon, Damaged — file-warning
      icon, Lost — file-x icon)
- When a row's Status is Detained, all three action buttons render
      visibly disabled (reduced opacity, `cursor-not-allowed`, `title`
      attribute explaining why) per `ui-rules.md`'s disabled-state rule —
      never simply hidden
- Clicking an enabled action opens a small confirmation modal naming the
      license being deactivated and the fee about to be charged, then submits
- `useLicenseRegister`, `useRenewLicense`, `useReplaceLicense` hooks

## Feature 8: International License Service

**Before you build this:** A driver who already holds an active local Class
3 (Car) license can be issued an international one. The system must check
that active local license server-side before allowing this — the UI can hide
ineligible drivers from the picker, but the backend has to enforce it
independently (never trust the frontend to have filtered correctly).

### 8.1 — [LOGIC]
- `InternationalLicense` entity + migration
- Service `issueInternationalLicense()`: verify the target `Drivers` row
      holds an active `Licenses` row of the Class-3/Car class (invariant #24)
      — 400 with a clear message if not; snapshot the $50 fee; set
      `ExpirationDate = IssueDate + 1 year` (fixed rule, `library-docs.md § 8`)
- `GET /international-licenses`, `POST /international-licenses`
- `GET /drivers/eligible-for-international` (drivers with an active
      Class-3 license) to power the picker

### 8.2 — [UI]
- `/applications/international` page — table: License, Driver, Based On
      (local license ID), Issued, Expires, Status (Active/Expired)
- `IssueInternationalLicenseModal` — driver picker (eligible drivers
      only), explanatory text ("The system verifies the driver holds an
      active Ordinary Driving License (Class 3) before issuing"), fee-labeled
      confirm button
- `useInternationalLicenses`, `useIssueInternationalLicense` hooks

## Feature 9: Detain & Release System

**Before you build this:** A license can be detained (e.g. for a traffic
violation), which records a fine and marks it detained. It only returns to
good standing through a formal Release Application being processed — never a
direct on/off toggle — so there's always a paper trail for why a license
became active again.

### 9.1 — [LOGIC]
- `DetainedLicense` entity + migration
- `DetainLicenseRequestDto` (licenseId, fineFees)
- Service `detainLicense()`: create `DetainedLicenses` row,
      `IsReleased = false`; reject if the license already has an open
      detention (no double-detaining the same license)
- `GET /detain-release/active-licenses` — licenses eligible to be
      detained (currently `IsActive = true`, no open detention) for the
      "Select active license" dropdown
- `GET /detain-release/register` — every detention, with a computed,
      **display-only** `totalDue = FineFees + ApplicationTypes(ReleaseDetainedLicense).ApplicationFees`
      (`library-docs.md § 8` — this is never persisted as its own column,
      since the release fee is only actually charged/snapshotted at release time)
- Service `releaseLicense()`: creates the `ReleaseApplication`
      (`ApplicationTypeID = ReleaseDetainedLicense`, fee snapshotted at this
      moment), then sets `IsReleased = true`, `ReleaseDate`,
      `ReleasedByUserID` (session user, invariant #29), links
      `ReleaseApplicationID` (invariant #27 — no other code path may flip
      `IsReleased`)
- `POST /detain-release/detain`, `POST /detain-release/:id/release`

### 9.2 — [UI]
- `/detain-release` page — description: "Violations management and
      license clearance." Two-column layout, **not** a modal-driven flow:
  - Left: `DetainLicenseFormCard` — a persistent inline form (License
    select limited to eligible active licenses, Fine Fees ($) input, "Detain
    license" primary button with a shield icon), with helper text below the
    button: "Release collects the fine plus a $20.00 release application
    fee." (the $20 is read live from `ApplicationTypes`, never hardcoded in
    this string at build time — `library-docs.md § 8`)
  - Right: "Detention register" `DataTable` — columns: Detain (`#N`),
    Driver, License (`#N`), Detained (date), Fine, Total due (computed, see
    9.1), Status (`Detained` pill), Actions (`Release` button, unlock icon)
- Clicking `Release` opens a brief confirmation modal restating the
      total amount being collected before submitting (destructive-adjacent
      action → confirm per `ui-rules.md`)
- `useEligibleLicensesForDetention`, `useDetentionRegister`,
      `useDetainLicense`, `useReleaseLicense` hooks

---

# Phase 4 — Utilities & Reports

## Feature 10: Driver & License History

**Before you build this:** Every clerk needs one place to look up any driver
by National ID, Driver ID, or name and see everything tied to them — every
license, application, test, detention, and release — in one scrollable audit
trail. This feature is read-only; it aggregates data that Features 1–9
already created, it doesn't create anything new.

### 10.1 — [LOGIC]
- `DriversRepository`: `findAll` (with license counts + detained flag for
      the status column), `search` (by national number, driver id, or name)
- `DriversService.getSummary(driverId)` — the person/contact fields plus
      `DriverID` and `CreatedDate` ("Driver Since") for the top summary card
- `DriversService.getLocalLicenseHistory(driverId)` — every `Licenses`
      row for this driver: License, Class, Issue Reason, Issued, Expires,
      Fees, Status
- `DriversService.getInternationalHistory(driverId)` — every
      `InternationalLicenses` row for this driver
- `DriversService.getTestLog(driverId)` — every `Tests` row across all of
      this driver's applications, newest first, including locked/appointment
      metadata
- `GET /drivers`, `GET /drivers/search`, `GET /drivers/:id/summary`,
      `GET /drivers/:id/local-licenses`, `GET /drivers/:id/international-licenses`,
      `GET /drivers/:id/test-log`

### 10.2 — [UI]
- `/drivers` page — search box + "Registered Drivers" table (Driver ID,
      Name, National Number, Licenses `active/total`, Status pill — "In Good
      Standing" or "Has Detained License", View History action)
- `/drivers/[id]` page:
  - Summary card: avatar (initials) + name + National Number, then two rows
    of four fields each — row 1: Date of Birth, Gender, Phone, Country; row
    2: Email, Address, Driver ID, Driver Since
  - `TabbedDetailView` directly below, three tabs each labeled with a live
    count: **Local Licenses (n)**, **International (n)**, **Test Log (n)**
  - Local Licenses tab → table: License, Class, Issue Reason, Issued,
    Expires, Fees, Status
  - International tab → same shape as the International Licenses register
    (Feature 8), filtered to this driver
  - Test Log tab → every test this driver has ever taken, across every
    application, newest first
  - "Back to all drivers" link at the bottom
- `useDrivers`, `useDriverSearch`, `useDriverSummary`,
      `useDriverLocalLicenses`, `useDriverInternationalLicenses`,
      `useDriverTestLog` hooks (four small, independently-loading queries
      rather than one giant aggregate call — lets each tab show its own
      loading state)

## Feature 11: Configuration

**Before you build this:** Now that fees and rules actually matter to real
transactions (Features 4–9), give any signed-in clerk a screen to edit them —
`LicenseClasses` (min age, validity years, fee), `ApplicationTypes` (fee),
`TestTypes` (fee) — without touching code. There is no admin gate on this
screen; it's accessible the same as every other page (invariant #31). This is
the editable counterpart to Feature 3's seed data. Editing a value here must
never rewrite `PaidFees`/`MinimumAllowedAge`/`DefaultValidityLength` on any
past transaction (invariant #28) — it only changes what future transactions
will use.

### 11.1 — [LOGIC]
- `UpdateLicenseClassRequestDto` (`minimumAllowedAge`,
      `defaultValidityLength`, `classFees` — all three editable; `className`
      is immutable)
- `UpdateApplicationTypeRequestDto` (`applicationFees` only —
      `applicationTypeTitle` is immutable)
- `UpdateTestTypeRequestDto` (`testTypeFees` only — `testTypeTitle`/
      `testTypeDescription` are immutable)
- `PATCH /lookup/license-classes/:id`, `PATCH
      /lookup/application-types/:id`, `PATCH /lookup/test-types/:id` — each
      accepts a **single-field partial update** cleanly (the UI autosaves
      per-field, not as one batched form submit)
- Explicitly confirm in REVIEW that these endpoints only ever affect the
      lookup row itself, never any historical `PaidFees` value already
      written to `Applications`/`TestAppointments`/`Licenses`

### 11.2 — [UI]
- `/settings/configuration` page — description: "Fees and license class
      rules apply immediately across all workflows."
- Three cards, matching the reference layout exactly:
  - "Application types" — ID, Title (read-only), Fee ($) numeric input
  - "Test types" — ID, Test (title + one-line description, read-only), Fee
    ($) numeric input
  - "License classes" (full-width, below the other two) — ID, Class
    (read-only), Min age, Validity (yrs), Fee ($) — three separate numeric
    inputs per row
- **Autosave, no page-level "Save" button:** each numeric input fires its
      `PATCH` on blur (or on `Enter`), matching the page's "apply
      immediately" description. Show a brief inline saved-state indicator
      per field (see `ui-rules.md`) so the clerk gets confirmation without a
      manual save step
- `useLicenseClasses`, `useUpdateLicenseClass`, `useApplicationTypes`,
      `useUpdateApplicationType`, `useTestTypes`, `useUpdateTestType` hooks

## Feature 12: Operational Dashboard

**Before you build this:** Build this last — it's a read-only aggregation
across nearly every other feature (active applications, tests scheduled
today, active drivers, detained licenses, recent applications, upcoming test
appointments), so every one of those data sources needs to already exist and
be populated for this screen to mean anything.

### 12.1 — [LOGIC]
- `DashboardService.getSummary()`: counts for active applications, tests
      scheduled today, active drivers, detained licenses; recent 3
      applications; upcoming (scheduled, unlocked) test appointments
- `GET /dashboard/summary` — a single endpoint, not five separate calls,
      to keep the dashboard's first paint fast

### 12.2 — [UI]
- `/dashboard` page — four `StatCard`s (Active Applications, Tests
      Today, Active Drivers, Detained Licenses), each with a "View →" link to
      the relevant page
- "Recent Applications" table (Applicant, Type, Status, Fees)
- "Upcoming Test Appointments" list (Applicant, test type, date, Scheduled pill)
- `useDashboardSummary` hook, `staleTime` short (dashboard should feel live)
