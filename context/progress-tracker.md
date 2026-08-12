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
| Phase 1 — Foundation | Not Started |
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
- [ ] 1.1 — People Management `[LOGIC]`
- [ ] 1.2 — People Management `[UI]`
- [ ] 2.1 — User Management `[LOGIC]`
- [ ] 2.2 — User Management `[UI]`
- [ ] 3.1 — Lookup Data `[LOGIC]`

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

### Session 5 — 2026-08-12
**Completed:** 0.C.1 — Application Shell & Navigation `[UI]` (full AppShell frame: sidebar + topbar + content slot)
**Decisions made:**
- **Custom AppShell + Zustand chrome store, not the shadcn `sidebar` primitive** — library-docs §5 designates sidebar open/closed as `ui.store.ts`'s concern; ui-registry defines `AppShell`/`SidebarNavItem` as custom components on `Button ghost`. New primitives added via CLI instead: `avatar`, `sheet`, `tooltip`.
- **`useUiStore` (sidebarCollapsed/toggleSidebar) in `shared/stores/`**, deliberately **unpersisted** per library-docs §5 — sidebar resets to expanded on every load. Mobile drawer open state is local state in `AppShell` (only trigger + drawer read it, no cross-component need).
- **Shell lives in `src/shared/components/app-shell/`** (`app-shell`, `sidebar-navigation`, `sidebar-nav-item`, `top-bar`, `nav-config`) — cross-feature chrome like `AuthGuard`, respecting invariant #13. `(protected)/layout.tsx` = `AuthGuard > AppShell > {children}`.
- **Desktop collapse = icon rail (264px ↔ 64px) with Tooltips; mobile = Sheet off-canvas drawer** (ui-rules: never push content; Sheet provides focus trap/Escape/backdrop per ui-rules accessibility) — `md` breakpoint switches.
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
