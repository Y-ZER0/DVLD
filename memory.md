# Memory — DVLD Session 3 (Feature 0.B.2: Authentication UI)

Last updated: 2026-08-12

## What was built

- **`apps/web` auth dependency setup:** added `axios` + `zustand` to `apps/web`, generated first shadcn primitives via CLI: `src/components/ui/{button,input,label,card}.tsx` (untouched generated files, per code-standards).
- **`src/shared/types/api-response.ts`** — `ApiResponse<T>` envelope type (`{ success, data }`) for service unwrapping.
- **`src/shared/stores/auth.store.ts`** — `useAuthStore` (Zustand + persist, name `dvld-auth-session`): `{ token, user, hasHydrated, setAuth, clearAuth, markHydrated }`. Lives in `shared/stores/` (NOT `features/auth/store/`) because apiClient/AuthGuard/TopBar all read it — cross-feature infra (invariant #13).
- **`src/shared/lib/api-client.ts`** — axios instance, baseURL `NEXT_PUBLIC_API_URL`, request interceptor adds `Bearer` from `useAuthStore.getState()`, response interceptor: 401 → `clearAuth()` + `window.location.replace('/')` **except** when the failing URL is `/auth/login` (login must show inline error, not redirect).
- **`src/shared/providers/auth-guard.tsx`** — `AuthGuard`: waits for `hasHydrated`, redirects to `/` if no token (useEffect + router.replace), renders children only when hydrated+authed.
- **`src/features/auth/services/auth.service.ts`** — `authService.login(dto)` → POST `/auth/login`, returns `AuthDto`. **`src/features/auth/hooks/use-login.ts`** — `useLogin` hook (isPending/error state; `setAuth` + `router.replace('/dashboard')` on success; generic "Invalid username or password." on failure).
- **`src/features/auth/components/`** — `auth-split-screen.tsx` (2-col: left dark brand panel gradient `from-sidebar-accent via-sidebar to-sidebar` + `bg-primary/25 blur-3xl` glow top-right, logo tile `bg-primary` + `IdCard`, headline, 3 bullets with green circular checkmarks; right `bg-card` panel with form; left hidden below `lg`), `sign-in-form.tsx` (Sign in h2 + muted subtext, Username w/ User icon + placeholder "admin", `PasswordInput`, full-width submit with spinner, inline error box), `password-input.tsx` (lock icon left, Eye/EyeOff right, `h-10 pl-9 pr-12`, button `size-10` for 40px hit target), `demo-accounts-card.tsx` (gate `process.env.NODE_ENV === "production"` → null; hardcoded admin/Admin@123 "Administrator", r.sabbagh/Sabbagh@123 "Licensing Officer"; divide-y rows, mono passwords).
- **Routes (Session 4 route swap):** `src/app/page.tsx` (thin login page at `/`, metadata only), `src/app/(protected)/layout.tsx` (AuthGuard wrapper), `src/app/(protected)/dashboard/page.tsx` (temporary protected landing at `/dashboard`: "Signed in as …" + Sign out — replaced by real dashboard shell in 0.C). `/login` route deleted.
- **Fixed pre-existing drift:** root `layout.tsx` no longer loads Geist; Inter (`--font-inter`) + JetBrains Mono only, per `ui-tokens.md`.

## Decisions made

- **Routes (Session 4): login at `/`, dashboard at `/dashboard`** (user decision, supersedes Session 3's `/auth` + dashboard-on-`/` plan) — all redirects updated (`AuthGuard` → `/`, 401 interceptor → `/`, login success → `/dashboard`).
- **Green circular check bullets** (user decision) instead of ui-registry's `ShieldCheck` — `ui-registry.md` table + icon note updated to match.
- **No TanStack Query for login**: login result = client session state (Zustand, invariant #1 / library-docs §5), not cacheable server data. react-query enters with Feature 1.
- **401 interceptor skips the login endpoint** — otherwise failed logins would redirect/wipe the inline error (this was deliberately preserved through useLogin's catch).
- `AuthGuard` in `shared/providers/` and store in `shared/stores/` — both cross-feature by necessity.

## Problems solved

- **Persist hydration race:** `hasHydrated` flag set via `onRehydrateStorage` — AuthGuard renders nothing until hydration completes, so returning users aren't flashed to / mid-hydration.
- **`AuthSplitScreen` glow without hex:** decorative blue glow = absolutely positioned `rounded-full bg-primary/25 blur-3xl` inside `overflow-hidden` panel, not a raw color (no hex in any component — token compliance).
- **40px hit-target rule vs. default `h-8` input:** bump inputs to `h-10` so the icon-only eye toggle (`size-10`) keeps its minimum hit target (ui-rules.md).
- **`$pid` is a reserved PowerShell variable** — foreach over PIDs failed silently; used `Get-NetTCPConnection` + owning-process PIDs and `Stop-Process -Id` only (session-1 lesson about broad node kills honored; no stray processes left).

## Current state

- WORKING: Two-column login screen at `/`; AuthGuard-protected `/dashboard` placeholder; sign-out clears store; apiClient interceptors wired; store persists across refresh.
- VERIFIED: `pnpm typecheck` + `pnpm build` green (3 packages, 6 static pages). Live API smoke: admin/Admin@123 → 200 + token + `{id:1, username:"admin", personId:1, fullName:"System Administrator"}`. Web dev server was started+killed; **browser-level test (form submit, guard redirect, 401 path) NOT yet performed.**
- NOT started: 0.C.1 Application Shell. REVIEW pass on 0.B.2 pending (AGENTS.md §3.1).
- Open follow-ups from 0.B.1 REVIEW (minors, unfixed): `jwt.strategy.ts:35` `?? 'dev-only-secret'` fallback (asymmetric with JwtModule — sign/verify mismatch if env missing; fail-loud recommended); `users.repository.ts:15` deprecated `queryRunner` arg to `super()` (typeorm 0.3 warning).

## Next session starts with

1. **Browser smoke test of 0.B.2** — `pnpm dev` (both apps): login with admin/Admin@123 and r.sabbagh/Sabbagh@123, wrong-password inline error, guard redirect to `/dashboard`, sign-out loop back to `/`, refresh-persistence of session.
2. **REVIEW skill pass on 0.B.2** (mandated post-UI by AGENTS.md §3.1 — check components against ui-tokens/ui-rules, invariant #9 DTO usage, STEP-comments).
3. Then **0.C.1 — Application Shell & Navigation `[UI]`**: `DashboardLayout` wrapping `/dashboard` (per Session 4 routing decision): sidebar `bg-sidebar` w/ 4 groups (OVERVIEW: Dashboard; REGISTRY: People, User Management; APPLICATIONS HUB: Local, International, Renewals; OPERATIONS: Drivers, Detain & Release, System Configuration), active-route filled pill (`bg-primary`), topbar (quick search + bell + Avatar/username from `useAuthStore`).

## Forms note (Session 4 decision — read before Feature 1.2)

Form-bearing features use **react-hook-form + zod** (`@hookform/resolvers`); schemas colocated with the form, rules mirroring the backend DTO. **Sign-in form excluded** (stays plain `useState`). Full pattern: `context/library-docs.md § 9`, `context/code-standards.md § 7`. Packages install into `apps/web` when 1.2 starts; `packages/shared` stays zero-runtime-deps.

## Open questions

- None blocking. (0.B.2 REVIEW may surface items; the two 0.B.1 minors await a decision: patch now vs. fold into 0.C session.)