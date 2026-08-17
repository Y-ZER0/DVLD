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
| Phase 2 — Application Lifecycle & Testing | Not Started |
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
- [ ] 4.1 — Local Driving License Applications `[LOGIC]`
- [ ] 4.2 — Local Driving License Applications `[UI]`
- [ ] 5.1 — Test Appointment & Results System `[LOGIC]`
- [ ] 5.2 — Test Appointment & Results System `[UI]`
- [ ] 6.1 — License Issuance `[LOGIC]`
- [ ] 6.2 — License Issuance `[UI]`

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
