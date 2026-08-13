# Memory — DVLD Session 11 (3.1 Lookup Data [LOGIC] + 2.2 REVIEW + ImageKit)

Last updated: 2026-08-13

## What was built

- **2.2 REVIEW** — 1 Important finding fixed: wait-for-server status toggle had NO failure feedback; `users-list.tsx` now surfaces a `role="alert"` banner via `getApiErrorMessage` (cleared per toggle). 3 minors logged, unfixed (user chosen): stale delete-dialog error on reopen, STEP-number gaps in create-user modal, 420px vs max-w-lg UpdatePasswordModal width.
- **3.1 Lookup Data `[LOGIC]`** (full slice):
  - **Supabase MCP migration `create_lookup_tables_seed`** applied to `tvpphretcytcicjnduxg` (user directive — NOT a TypeORM migration file): enums `test_type_enum` (Vision/Written/Street), `application_type_enum` (6 values, labels = `ApplicationType` enum strings); tables `LicenseClasses`/`ApplicationTypes`/`TestTypes` (SERIAL PKs, PascalCase, `numeric(10,2)` fees); seeds 7/6/3 verified.
  - `packages/shared`: `enums/test-type.enum.ts` (`VISION='Vision'` style, mirroring `Gender`), `enums/application-type.enum.ts`, `dtos/license-class.dto.ts` / `application-type.dto.ts` / `test-type.dto.ts` (fees are `string`).
  - `apps/api/src/modules/lookup/`: entities (enum columns use `enumName` + shared enum aliased as `ApplicationTypeEnum`/`TestTypeEnum` — entity class shares the enum's name), 3 read-only repositories (extend `Repository`, `findAll` id-ASC), `LookupService` (toDto gates, exported for cross-module consumers), `LookupController` (`@Controller('lookup')`, GET license-classes / application-types / test-types), `LookupModule` wired into `AppModule`.
- **ImageKit** (user note): convention — `People.PhotoUrl` stores ImageKit URLs; `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` added to web `.env.local` + `.env.example` (public endpoint only, no key); `apps/web/src/shared/lib/imagekit.ts` `buildPersonPhotoUrl(url, {thumbnail|width|height})` → `?tr=fo:face,w-,h-`, returns input unchanged when unset/endpoint missing. Nothing consumes it yet.
- **RECOVER fix**: `apps/api/tsconfig.json` — removed `incremental: true` (stale tsbuildinfo + nest-cli `deleteOutDir:true` had been emitting a partial `dist` → MODULE_NOT_FOUND `./app.controller` on boot). Fresh rebuild emits everything; turbo caches.

## Decisions made

- **Lookup schema goes via Supabase MCP, not TypeORM migrations** (user directive) — deviation from architecture.md § System Boundaries, documented in entity headers + tracker. Do NOT create TypeORM migration files for tables created this way (they'd replay on `migration:run`).
- **Seed source = build-plan.md § 3.1 inline values** (user confirmed; `System_Requirments.md` absent from repo). Class names normalized: `Ordinary Driving License (Car)`, `Commercial (Taxi)` (invariant #24 wording). **TestType descriptions provisional** until the requirements file surfaces.
- **Fees flow as strings** — decimal columns → `string` in DTOs; all fee math stays server-side (invariant #28).
- **One LookupController, not three** (single-controller-per-module convention; Feature 11's `PATCH /lookup/:kind/:id` goes under the same prefix).
- **`LookupModule` exports `LookupService` only** — Features 4.1/5.1/9.1 must import it for config reads (age gate, fee snapshots), never a foreign repository.
- **RLS stays disabled** (user confirmed) — JWT guard is the access layer; Supabase advisor advisory shelved.

## Problems solved

- **Api `dist` was silently partial** (api boot: `Cannot find module './app.controller'`) — stale incremental cache skipped emission after deleteOutDir; fixed by dropping `incremental: true` + fresh `tsc` emit; full route map confirmed on boot.
- **Toggle failure silence** (2.2 REVIEW Important) — banner pattern added.
- **Entity ↔ DB drift check** — API boot with `synchronize:true` validated the MCP-created tables against entity metadata (no drift).

## Current state

- WORKING & **verified live for the first time**: boot API against Supabase → admin login → JWT → all 3 `/api/lookup/*` endpoints returned correct seed rows. typecheck/lint/build green (now: `nest build` emits full dist).
- Historical endpoints (people/users CRUD, toggle, delete 409 stay-open) still NOT verified at runtime (carried).
- Backlog REVIEWs still owed: 0.B.2, 0.C.1, 1.1 (user accepts flagging, not catching up).
- 3.1 REVIEW: 0 issues. Next mandated gate: Feature 4.1 `[LOGIC]`.

## Next session starts with

**4.1 — Local Driving License Applications `[LOGIC]`** — ARCHITECT first: `Application` (generic; `ApplicationStatus` 1:New 2:Cancelled 3:Completed as int) + `LocalDrivingLicenseApplication` entities + migrations (Supabase MCP per Session 11 precedent unless redirected), `CreateLocalLicenseApplicationRequestDto` (personId, licenseClassId), service = applicant age ≥ `LicenseClasses.MinimumAllowedAge` via `LookupService.findAllLicenseClasses()` + snapshot `ApplicationFees` onto `PaidFees` (invariant #28) + `ApplicationStatus = New` + `CreatedByUserID` from `@CurrentUser()` (invariant #29), `POST` / `GET` (paginated, filterable) / `GET :id` (applicant summary) / `PATCH :id/cancel`. Then its REVIEW → 4.2 `[UI]`.

## Open questions

- Live smoke coverage for older slices still owed (offer a login → people CRUD → users toggle → combobox → delete-409 pass).
- TestType descriptions: replace provisional seed text when `System_Requirments.md` values surface.
- Roles column return strategy (A: EXISTS subquery vs B: client-side) — pending Drivers feature.
- pg deprecation warning on API boot (concurrent client.query) — non-blocking, future RECOVER pass.