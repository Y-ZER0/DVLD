# architecture.md

## Tech Stack

| Layer | Choice |
|---|---|
| Backend framework | NestJS (TypeScript-native, DI, decorators) |
| ORM | TypeORM + Repository pattern |
| Database | PostgreSQL, hosted on Supabase |
| Frontend framework | Next.js — **App Router**, not Pages Router |
| Server state | TanStack Query |
| Client state | Zustand |
| Styling | Tailwind CSS + shadcn/ui |
| Monorepo | pnpm workspaces (`packages/shared` for DTO alignment) |
| Auth | JWT via `@nestjs/passport` + `passport-jwt`, session held in a Zustand store |

Rationale for each choice is documented in full in the project's
`fullstack-architecture-plan.md` (Part 1) — do not re-litigate the stack
choice, it is fixed.

## Project Folder Structure

```
/
├── apps/
│   ├── web/                              # Next.js frontend
│   └── api/                              # NestJS backend
├── packages/
│   └── shared/                           # Plain TS interfaces + enums, zero runtime deps
│       └── src/
│           ├── dtos/
│           │   ├── auth.dto.ts
│           │   ├── person.dto.ts
│           │   ├── user.dto.ts
│           │   ├── license-class.dto.ts
│           │   ├── application-type.dto.ts
│           │   ├── test-type.dto.ts
│           │   ├── application.dto.ts
│           │   ├── test-appointment.dto.ts
│           │   ├── license.dto.ts
│           │   ├── international-license.dto.ts
│           │   ├── detained-license.dto.ts
│           │   └── driver.dto.ts
│           ├── enums/
│           │   ├── gender.enum.ts
│           │   ├── application-type.enum.ts
│           │   ├── test-type.enum.ts
│           │   ├── application-status.enum.ts
│           │   └── issue-reason.enum.ts
│           └── index.ts
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### `apps/api/src/modules/` (backend feature modules — one per domain)

```
modules/
├── auth/                     # login, JWT strategy, guards
├── people/                   # People CRUD + National Number validation
├── users/                    # Users CRUD, linked to People, password hashing
├── lookup/                   # LicenseClasses, ApplicationTypes, TestTypes (config)
├── local-license-applications/  # Applications + LocalDrivingLicenseApplications
├── testing/                  # TestAppointments + Tests, sequencing + locking
├── licenses/                 # Licenses: issuance, renewal, replacement
├── international-licenses/   # InternationalLicenses, gated on active Class 3
├── detain-release/           # DetainedLicenses, release workflow
├── drivers/                  # Drivers + aggregated history views
└── dashboard/                # Read-only aggregation across the above (no own entity)
```

Each module follows the standard NestJS layering:
`controller → service → repository → entity`, with `dtos/` for validated
request shapes. See `fullstack-architecture-plan.md § 5.1` for the exact file
tree per module (`controllers/`, `services/`, `repositories/`, `dtos/`,
`entities/`, `<module>.module.ts`).

### `apps/web/src/features/` (frontend feature modules — mirrors backend)

```
features/
├── auth/            (ui/, store/, services/, dtos/)
├── people/          (ui/, services/, dtos/, hooks/)
├── users/           (ui/, services/, dtos/, hooks/)
├── configuration/   (ui/, services/, dtos/, hooks/)   — lookup tables, editable
├── local-license-applications/  (ui/, services/, dtos/, hooks/) — includes the
│                                  test pipeline + issue-license UI, since the
│                                  product combines them on one detail page
├── renewals-replacements/       (ui/, services/, dtos/, hooks/)
├── international-licenses/      (ui/, services/, dtos/, hooks/)
├── detain-release/              (ui/, services/, dtos/, hooks/)
├── drivers/                     (ui/, services/, dtos/, hooks/)
└── dashboard/                   (ui/, services/, dtos/, hooks/)
```

`apps/web/src/shared/` (stores, providers, lib, types) and
`apps/web/src/components/ui/` (shadcn-generated primitives) follow
`fullstack-architecture-plan.md § 4.1` exactly — do not restructure them.

## System Boundaries

| Folder | Represents |
|---|---|
| `apps/api/src/modules/*` | One bounded domain. Owns its entity, its table(s), its business rules. Never imports another module's repository directly — cross-module needs go through the other module's exported *service*. |
| `apps/web/src/features/*` | One bounded UI domain. Never imports from another feature folder — shared needs go through `shared/` or `@repo/shared`. |
| `packages/shared` | The only place a response shape (`*Dto`) is defined. Both apps import from here; neither redefines it. |
| `apps/api/src/database/migrations` | The only way schema changes reach Supabase in any environment above local dev. `synchronize: true` is dev-only. |
| `apps/web/src/components/ui` | shadcn-generated primitives. Do not hand-edit; regenerate via the shadcn CLI if a primitive needs to change. |

## Data Flow & Database Schema

Server-state flow (read) and mutation flow (write) follow
`fullstack-architecture-plan.md § 6` exactly:
`UI → TanStack Query hook → service → HTTP → Controller → Service → Repository
→ Entity → back up through toDto() → HTTP → Query cache → UI`. Client-only
state (sidebar, theme, session) never touches this path — it's Zustand,
in-memory/persisted, no network.

Full schema (source of truth — mirror this exactly in TypeORM entities and
migrations):

```dbml
Enum gender_enum {
  Male
  Female
}
Enum test_type_enum {
  Vision
  Written
  Street
}
Enum application_type_enum {
  NewDrivingLicense
  RenewDrivingLicense
  ReplacementForDamagedLicense
  ReplacementForLostLicense
  ReleaseDetainedLicense
  NewInternationalLicense
}

Table People {
  PersonID int [pk, increment]
  NationalNumber varchar [unique, not null, note: 'Requires validation']
  FirstName varchar
  LastName varchar
  DateOfBirth date
  PhotoUrl varchar
  Gender gender_enum
  Address varchar
  Phone varchar
  Email varchar
  CountryName varchar
}

Table Users {
  UserID int [pk, increment]
  PersonID int [unique, ref: > People.PersonID, note: 'one account per person — enforced by unique constraint, 2.1']
  Username varchar [unique]
  Password varchar [note: 'bcrypt hash only, never plaintext']
  IsActive boolean
}

Table Drivers {
  DriverID int [pk, increment]
  PersonID int [unique, ref: - People.PersonID]
  CreatedByUserID int [ref: > Users.UserID]
  CreatedDate datetime
}

Table LicenseClasses {
  LicenseClassID int [pk, increment]
  ClassName varchar
  MinimumAllowedAge int
  DefaultValidityLength int [note: 'years']
  ClassFees decimal
}

Table ApplicationTypes {
  ApplicationTypeID int [pk, increment]
  ApplicationTypeTitle application_type_enum
  ApplicationFees decimal
}

Table TestTypes {
  TestTypeID int [pk, increment]
  TestTypeTitle test_type_enum
  TestTypeDescription varchar
  TestTypeFees decimal
}

Table Applications {
  ApplicationID int [pk, increment]
  ApplicantPersonID int [ref: > People.PersonID]
  ApplicationDate datetime
  ApplicationTypeID int [ref: > ApplicationTypes.ApplicationTypeID]
  ApplicationStatus int [note: '1:New, 2:Cancelled, 3:Completed']
  LastStatusDate datetime
  PaidFees decimal
  CreatedByUserID int [ref: > Users.UserID]
}

Table LocalDrivingLicenseApplications {
  LocalDrivingLicenseApplicationID int [pk, increment]
  ApplicationID int [unique, ref: - Applications.ApplicationID]
  LicenseClassID int [ref: > LicenseClasses.LicenseClassID]
}

Table TestAppointments {
  TestAppointmentID int [pk, increment]
  TestTypeID int [ref: > TestTypes.TestTypeID]
  LocalDrivingLicenseApplicationID int [ref: > LocalDrivingLicenseApplications.LocalDrivingLicenseApplicationID]
  AppointmentDate datetime
  PaidFees decimal
  CreatedByUserID int [ref: > Users.UserID]
  IsLocked boolean
}

Table Tests {
  TestID int [pk, increment]
  TestAppointmentID int [unique, ref: - TestAppointments.TestAppointmentID]
  TestResult boolean
  Notes varchar
  CreatedByUserID int [ref: > Users.UserID]
}

Table Licenses {
  LicenseID int [pk, increment]
  ApplicationID int [unique, ref: - Applications.ApplicationID]
  DriverID int [ref: > Drivers.DriverID]
  LicenseClassID int [ref: > LicenseClasses.LicenseClassID]
  IssueDate date
  ExpirationDate date
  Notes varchar
  PaidFees decimal
  IsActive boolean
  IssueReason int [note: '1:FirstTime, 2:Renew, 3:Replacement(Damaged), 4:Replacement(Lost)']
  CreatedByUserID int [ref: > Users.UserID]
}

Table InternationalLicenses {
  InternationalLicenseID int [pk, increment]
  ApplicationID int [unique, ref: - Applications.ApplicationID]
  DriverID int [ref: > Drivers.DriverID]
  IssuedUsingLocalLicenseID int [unique, ref: - Licenses.LicenseID]
  IssueDate date
  ExpirationDate date
  IsActive boolean
  CreatedByUserID int [ref: > Users.UserID]
}

Table DetainedLicenses {
  DetainID int [pk, increment]
  LicenseID int [ref: > Licenses.LicenseID]
  DetainDate datetime
  FineFees decimal
  CreatedByUserID int [ref: > Users.UserID]
  IsReleased boolean
  ReleaseDate datetime
  ReleasedByUserID int [ref: > Users.UserID]
  ReleaseApplicationID int [unique, ref: - Applications.ApplicationID]
}
```

## Authentication & Core Patterns

- `Users.Username` + `Users.Password` (bcrypt hash, cost factor 12, matching
  `fullstack-architecture-plan.md § 7.14`) is the only login credential.
- Every `Users` row is linked to exactly one `People` row — there is no such
  thing as a login identity without a citizen record behind it.
- **There is no `Admin` entity, role column, or permission tier anywhere in
  this system.** The `Users` table has exactly the columns in
  `architecture.md`'s schema (`UserID`, `PersonID`, `Username`, `Password`,
  `IsActive`) — nothing else. Every authenticated user is simply a
  department employee/operator with identical access to every screen and
  endpoint (see invariant #31). A username happening to be `admin`, or a job
  title like "Administrator"/"Licensing Officer" appearing next to a seed
  account on the sign-in screen, is descriptive flavor text only — it is
  never read anywhere in the codebase to make an authorization decision.
- `POST /api/auth/login` validates credentials, returns a JWT
  (`JWT_EXPIRES_IN` per `library-docs.md`) plus a minimal `AuthDto.user` shape
  (`{ id, username, personId, fullName }` — no role/permission field exists to include).
- `JwtStrategy` validates the token on every request; `JwtAuthGuard` is applied
  globally (`@UseGuards(JwtAuthGuard)` per controller, or a global guard with
  `@Public()` opt-outs for `/auth/login`).
- Frontend: `useAuthStore` (Zustand, `persist` middleware) holds `token` +
  `user`. `apiClient` (axios) reads the token via `useAuthStore.getState()` in
  a request interceptor — never via `localStorage.getItem` directly, and never
  via a React hook inside a non-component context.
- A 401 response anywhere clears the auth store and hard-redirects to
  `/` (the login route, see `fullstack-architecture-plan.md § 8.1`).
- All other request/response, mutation, and query-key patterns follow
  `fullstack-architecture-plan.md § 6, § 7` exactly — see `library-docs.md`
  for DVLD-specific worked examples.

## Invariants — Absolute Rules the Agent Must Never Violate

### A. Architecture invariants (apply to every feature, every module)

1. Server state → TanStack Query. Client/UI state → Zustand. No exceptions.
2. Zustand stores are module-level singletons — never wrapped in a Provider.
3. Always read Zustand via a selector (`useStore(s => s.field)`), never the
   whole store object.
4. No UI component calls `apiClient`/`axios` directly — always
   UI → hook → service.
5. Always use the query key factory (`*Keys.ts`) — never a raw inline array.
6. Every mutation hook calls `invalidateQueries` on success (plus
   `setQueryData` for an instant detail-cache patch where useful).
7. Frontend services are pure, stateless async functions — no held state.
8. Frontend request DTOs are plain interfaces (shape only); validation is the
   backend's job.
9. Every response shape (`*Dto`) is defined exactly once, in `packages/shared`.
10. Backend request DTOs are classes with `class-validator` decorators — a
    plain interface is silently unvalidated by NestJS's `ValidationPipe`.
11. TypeORM entities never leave the backend. Every service maps to a DTO via
    an explicit `toDto()` method before returning.
12. Pages (`page.tsx`) are thin: composition and metadata only, no hooks, no
    services, no local state.
13. Features never import from other features — cross-feature needs go
    through `shared/` or `@repo/shared`.
14. `ValidationPipe` runs globally with `whitelist: true` and
    `forbidNonWhitelisted: true`.
15. `Users.Password` is never returned in any response
    (`@Column({ select: false })` + `toDto()` both enforce this).
16. Use the Supabase **Transaction pooler** URL (port 6543) at runtime; use the
    **Direct** URL (port 5432) only for running migrations.
17. `synchronize: false` in production, always — schema changes go through
    migrations only.
18. A feature is only "done" when its entire vertical slice exists (entity →
    service → controller → DTO → hook → service → UI). No partial slices.

### B. DVLD business-logic invariants (domain-specific — verify explicitly in REVIEW)

19. Test order is strictly Vision → Written → Street. The UI must not expose a
    "Record Result" action for a stage whose predecessor has not shown
    `TestResult = true` (Passed), and the backend must re-check this itself
    — never trust the frontend to have enforced it.
20. Once a `Tests` row is saved against a `TestAppointment`, that appointment's
    `IsLocked` becomes `true` permanently. A locked appointment can never be
    edited or its result changed.
21. A failed test does **not** unlock the next stage and does **not** reuse
    the failed appointment. Progressing requires booking a brand-new
    `TestAppointments` row for the same `TestTypeID`. The failed row remains
    forever, locked, in Appointment History.
22. The "Issue License" action is only enabled once every required `TestTypes`
    stage for that `LocalDrivingLicenseApplications` row shows a `Tests` row
    with `TestResult = true`. Enforce this server-side with a 409/400 if
    bypassed.
23. Issuing a License for a `Person` who has no existing `Drivers` row
    auto-creates one (`CreatedByUserID` = the acting session user) inside the
    **same database transaction** as the `Licenses` insert. Never two
    separate, non-atomic writes.
24. Issuing an `InternationalLicenses` row requires the target `Drivers` row
    to hold at least one `Licenses` row where `LicenseClassID` refers to the
    "Ordinary Driving License (Car)" class **and** `IsActive = true`. This is
    checked server-side, not just hidden/disabled in the UI.
25. `NationalNumber` format and uniqueness are validated at the `People` layer
    before create/update. A duplicate returns `409 Conflict`, not a generic
    500.
26. Renewing or replacing a license sets `IsActive = false` on the prior
    `Licenses` row as part of issuing the new one. A driver may never hold two
    `IsActive = true` rows for the same `LicenseClassID` simultaneously —
    enforce with a transaction, not a UI assumption.
27. `DetainedLicenses.IsReleased` only becomes `true` through a completed
    `ReleaseApplication` (`ApplicationTypeID = ReleaseDetainedLicense`) —
    never a direct field toggle from any endpoint.
28. All fee amounts (`ApplicationFees`, `TestTypeFees`, `ClassFees`) are read
    from the lookup tables **at the moment of the transaction** and copied
    onto the transactional row's `PaidFees`. Never hardcode a fee in the
    frontend. Never recompute a historical `PaidFees` from current
    configuration — changing a fee in System Configuration must not alter
    any past record.
29. Every mutating endpoint that changes licensing/enforcement state (test
    result, issuance, renewal, detain, release) persists
    `CreatedByUserID`/`ReleasedByUserID` from the authenticated session
    (`@CurrentUser()`), never from the request body.
30. The Mandatory Inline Documentation Protocol (`AGENTS.md § 3.2`,
    `code-standards.md`) is itself an invariant of this codebase, not a style
    suggestion. Code without step-comments fails REVIEW.
31. There is no role-based access control in this system. Do not add a
    `Role` column, a `RolesGuard`, a permissions table, or any
    `@Roles(...)` decorator. Every row in `Users` has identical access.
    `JwtAuthGuard` alone (authenticated vs. not) is the only access check
    that exists anywhere in the app. If a future requirement genuinely needs
    tiered permissions, that is a deliberate architecture change to
    `architecture.md` first — never an assumption baked into a single
    feature.
32. A `Licenses` row that currently has an **active, unreleased** detention
    (a `DetainedLicenses` row with `IsReleased = false`) cannot be renewed or
    replaced. The renewal/replacement service must check for an open
    detention and reject with `409 Conflict` if one exists (server-side,
    invariant #24-style enforcement) — and the corresponding UI actions
    (Renew / Damaged / Lost) must render visibly disabled, not hidden, for
    that row, per `ui-rules.md`'s disabled-state rule.
