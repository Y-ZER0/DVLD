# ui-registry.md

Every component below is observed directly in the reference screenshots.
Reuse these — don't invent a second pattern for something that already has
one here. All are built on shadcn/ui primitives (`components/ui/`) styled
with the tokens in `ui-tokens.md`.

| Component | Built on | Used in | Notes |
|---|---|---|---|
| `AppShell` | — (layout) | every authenticated page | Fixed dark sidebar (`bg-sidebar`, 264px bar → 64px icon rail when collapsed via `useUiStore`) + white topbar + light content area (`bg-background`, `max-w-screen-2xl`). Below `md` the sidebar becomes a `Sheet` off-canvas drawer. Sidebar groups: OVERVIEW, REGISTRY, APPLICATIONS HUB, OPERATIONS, each a small uppercase `text-sidebar-foreground/60` label. |
| `SidebarNavItem` | `Button` (ghost variant) | `AppShell` | Icon (lucide-react) + label. Active state: filled `bg-primary text-primary-foreground` rounded pill, matching the "Dashboard"/"People Management" active rows in the screenshots. Inactive: `text-sidebar-foreground`, hover `bg-sidebar-accent`. |
| `TopBar` | `Input`, `Avatar` | `AppShell` | Left: quick-search input with search icon, placeholder `"Quick search: national ID, license, driver..."`. Right: bell icon, `Avatar` (initials, e.g. "AM"), username text. |
| `PageHeader` | — | every list/detail page | `h1` title + one-line muted description below it. Primary action button (if any) is right-aligned on the same row (`+ Add Person`, `+ Create User`, `+ New Application`, `New International License`). |
| `StatCard` | `Card` | Dashboard | Label top-left, large number below it, icon top-right (muted), one-line description bottom-left, `"View →"` link bottom-right. Four of these in a `grid-cols-4` row on desktop. |
| `DataTable` | `Table` | People, Users, Applications, Drivers lists | Filter `Input` directly above the table. Header row: column labels, right-most column always "Actions" or "Manage". Footer: `"N records · Page X of Y"` left, `Prev`/`Next` buttons right. Row hover: subtle `bg-muted/50`. |
| `StatusPill` | `Badge` | everywhere a state is shown | See `ui-rules.md § Status Color Mapping` for the exact color per label. Always rounded-full, small text, colored background + matching text color, never color alone (see accessibility notes in `ui-rules.md`). |
| `IconActionButton` | `Button` (ghost, icon size) | table Action columns | Pencil (edit), Trash (delete, destructive-colored), Key (reset password). Minimum 40×40px hit target even though the icon itself is smaller. |
| `RolePill` | `Badge` (outline) | People Management "Roles" column | Small outline badges — "User", "Driver", "Citizen" — can stack multiple per row (see Marcus Reid: Driver + User). |
| `FormModal` | `Dialog` | Add/Edit Person, Create User, Update Password, New Application, Issue License, Release confirmation, Renew/Replace confirmation | Title (`text-lg font-semibold`) + one-line muted description directly under it. Form fields in a 2-column grid where fields pair naturally (First/Last Name, Date of Birth/Gender), single column otherwise. Footer right-aligned: `Cancel` (outline) then primary action (filled `bg-primary`). Top-right `X` close icon. **Not** used for Detain — that's an inline form card, see `DetainLicenseFormCard` below. |
| `Combobox` / searchable `Select` | shadcn `Command` + `Popover` | "Link to Person" picker, "Select a citizen" picker, driver picker | Type-to-filter list, each option formatted `Name (National-Number)`. |
| `AnnotatedSelect` | shadcn `Select` | License Class picker | Each option shows the constraint inline: `"Ordinary Driving License (Car) (Min age 18)"`. |
| `ToggleSwitch` | shadcn `Switch` | Users active/inactive | Paired immediately with a `StatusPill` (`Active`/`Inactive`) to the right of the switch — never the switch alone. |
| `TestPipelineStepper` | `Card` + custom row | Application detail page | Three stacked rows. Completed stage: light-green background (`bg-success/10`), green circular check icon. Current/active stage: numbered circle in `bg-warning` (orange), right-aligned `Scheduled <date>` pill + `Record Result` primary button. Locked stage: gray numbered circle, muted text, right-aligned `Locked` pill with a lock icon. |
| `AppointmentHistoryList` | `Card` + row list | Application detail page | Reverse-chronological. Each row: `<Test Type> · <date>` left, fee + result `StatusPill` + `Locked` badge right. |
| `TwoColumnDetailLayout` | grid | Application detail page | Left column: fixed-width summary `Card` (applicant/entity info + primary action button). Right column: flexible-width `Card` (pipeline/related records). Stacks to one column below `lg` breakpoint. |
| `ConfirmationBanner` | inline (not a `Card`) | post-issuance state on detail pages | Light-green rounded box with a check/award icon, bold headline (`"License LIC-3 issued"`), muted subtext (`"Valid 2026-08-11 to 2036-08-11"`). Replaces the action button once the action is complete — never shown alongside a still-active action button for the same thing. |
| `EmptyState` | — | any list with zero rows | Not directly captured in the reference screenshots, but required: centered icon + one-line message + primary action button if applicable. Build to match `DataTable` spacing. |
| `AuthSplitScreen` | grid (2-col) | `/` | Left `bg-sidebar` panel (hidden below `lg`): logo, `h1` headline, one-line description, 3 feature bullets each with a circular green check icon (`bg-success/90` circle + white `CircleCheck` — user decision 0.B.2, was `ShieldCheck`). Right white panel, vertically centered form: "Sign in" `h2` + muted subtext, `PasswordInput`-style fields, full-width primary `Sign in` button, `DemoAccountsCard` beneath. |
| `PasswordInput` | shadcn `Input` + `Button` (icon) | `AuthSplitScreen` | Lock icon left, `Eye`/`EyeOff` toggle button right (toggles `type="password"`/`"text"`, never logs or exposes the value otherwise). |
| `DemoAccountsCard` | `Card` | `AuthSplitScreen` | Small bordered card, "Demo accounts" label, then one row per seed user: `username` (bold) + an informal label (muted, e.g. "Administrator") left, password (mono, muted) right. **Dev/staging-only** — render nothing in production (see `build-plan.md` 0.B.2). The label is decorative copy only, never a stored/enforced role. |
| `ProfileSummaryCard` | `Card` | Driver detail page | Avatar + name + National Number header row, then two 4-column rows of labeled fields (row 1: Date of Birth, Gender, Phone, Country; row 2: Email, Address, Driver ID, Driver Since). Collapses to a 2-column, then 1-column grid below `md`/`sm`. |
| `TabbedDetailView` | shadcn `Tabs` | Driver detail page | Tab triggers show a live count in parentheses, e.g. `Local Licenses (1)`, `International (1)`, `Test Log (3)`. Active tab uses the same filled-pill treatment as `SidebarNavItem`'s active state, scaled down. Each tab panel is its own `DataTable`. |
| `LicenseRegisterTable` | `DataTable` | Renewals & Replacements | Flat table of every local license (not filtered to one driver). Actions column holds three buttons (`Renew`, `Damaged`, `Lost`) rather than the usual edit/delete pair — all three render disabled together when the row's Status is `Detained` (see `ui-rules.md` disabled-state rule). |
| `DetainLicenseFormCard` | `Card` (persistent, not a `Dialog`) | Detain & Release, left column | Unlike every other create-action in this app, this is **not** a modal — it's an always-visible inline form: eligible-license `Select`, "Fine Fees ($)" `Input`, primary "Detain license" button (shield icon), helper text below stating the release fee. |
| `InlineEditableConfigTable` | `DataTable` + inline `Input`s | System Configuration | Numeric cells (Fee, Min age, Validity) are live `Input`s, not display text — no row-level edit button and no page-level Save button. Each input autosaves on blur/`Enter`; show a brief inline saved-state affordance per `ui-rules.md`. ID and title/name columns are always plain, non-editable text. |

## Captured Pattern Details (imprint)

### AuthSplitScreen

File: `apps/web/src/features/auth/components/auth-split-screen.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-gradient-to-br from-sidebar-accent via-sidebar to-sidebar` (left panel); `bg-card` (right panel) |
| Border           | none |
| Border radius    | logo tile `rounded-lg`; checkbox `rounded-full` |
| Text — primary   | `text-sidebar-primary-foreground` (headline, wordmark); `text-foreground` implicit on right via `bg-card` |
| Text — secondary | `text-sidebar-foreground` (paragraph, bullets) |
| Spacing          | panel padding `p-10`; content block `px-10 pb-16`; bullet list `mt-8 space-y-4` |
| Hover state      | none |
| Shadow           | none (glow is a blurred `bg-primary/25` blob, not a shadow) |
| Accent usage     | `bg-primary text-primary-foreground` logo tile (size-10, IdCard icon); `bg-success/90` circular check bullets |

**Pattern notes:** Left brand panel reuses the `--sidebar` token family (ui-tokens.md Reuse Note) — never invent a second navy for this screen. Decorative glow = absolutely-positioned `rounded-full bg-primary/25 blur-3xl` clipped by `overflow-hidden`, not box-shadow. Headline uses `text-4xl font-bold` (larger than the standard PageHeader `text-2xl` — this is a landing-style hero). Below `lg` the left panel is dropped entirely (`hidden lg:flex`), right panel becomes the full page.

### PasswordInput

File: `apps/web/src/features/auth/components/password-input.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | transparent (shadcn Input) |
| Border           | `border-input` (shadcn Input) |
| Border radius    | `rounded-lg` (shadcn Input) |
| Text — primary   | `text-foreground` (Input) |
| Text — secondary | `text-muted-foreground` icons |
| Spacing          | `h-10 pl-9 pr-12` (icon slots: left `left-3`, right `right-1`) |
| Hover state      | `hover:text-foreground` (toggle button) |
| Shadow           | none |
| Accent usage     | none — icons are muted, not branded |

**Pattern notes:** Input height on the login forms is `h-10` (taller than the default `h-8`) so the icon-only toggle keeps its 40×40 hit target (ui-rules.md § Accessibility). Toggle: `Button variant="ghost" size="icon"` positioned `absolute right-1 top-1/2 size-10 -translate-y-1/2`, `type="button"`, `aria-label={visible ? "Hide password" : "Show password"}`. Never log/expose the value.

### SidebarNavItem

File: `apps/web/src/shared/components/app-shell/sidebar-nav-item.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | active: `bg-primary`; inactive: transparent on `bg-sidebar` |
| Border           | none |
| Border radius    | `rounded-md` (pill on the active item) |
| Text — primary   | active: `text-primary-foreground`; inactive: `text-sidebar-foreground` |
| Text — secondary | label `text-sm font-medium`; sr-only twin when collapsed |
| Spacing          | `h-10 w-full gap-2.5 px-2.5`; rows `space-y-1`; groups `space-y-6`, nav `px-2 py-4`; group label `px-2 pb-1.5 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60` |
| Hover state      | inactive: `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`; active: `hover:bg-primary` (pill never grays) |
| Shadow           | none |
| Accent usage     | icon `size-4` shrink-0; collapsed rail: icon-only + `Tooltip side="right"` with the label |

**Pattern notes:** Links are `Button ghost asChild > Link` — never a bare `<a>` (button primitives own focus states). Active check in the parent (`sidebar-navigation.tsx`): exact match, or deeper path within the section (`/applications/local/[id]` lights `/applications/local`). Icon-rail label is `sr-only` (never removed from the a11y tree). Only `SidebarNavItem` patterns here — `IconActionButton` (ghost sizes for tables) is a different shape.

### SidebarNavigation (brand header + nav groups)

File: `apps/web/src/shared/components/app-shell/sidebar-navigation.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | aside: `bg-sidebar`; brand row: same surface, `border-b border-sidebar-border` |
| Border           | `border-b border-sidebar-border` (brand row); aside `border-r border-sidebar-border` |
| Border radius    | logo tile `rounded-lg` (generic scheme) |
| Text — primary   | wordmark `text-sm font-semibold tracking-wide text-sidebar-primary-foreground` |
| Text — secondary | group labels `text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60` |
| Spacing          | brand row `h-16 gap-3 px-4`; logo tile `size-10` + `IdCard size-5`; nav `flex-1 space-y-6 overflow-y-auto px-2 py-4` |
| Hover state      | none (rows delegate to `SidebarNavItem`) |
| Shadow           | none |
| Accent usage     | logo tile `bg-primary text-primary-foreground` — same pattern as `AuthSplitScreen` header (ui-tokens.md Reuse Note: one navy, one logo) |

**Pattern notes:** This is the single source of the sidebar body — the desktop `aside` and the mobile `Sheet` both render it, so expanded/collapsed/drawer can never drift. Wordmark hides in the icon rail; group labels hide entirely when collapsed.

### TopBar

File: `apps/web/src/shared/components/app-shell/top-bar.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-card` (white), sticky |
| Border           | `border-b border-border` |
| Border radius    | n/a |
| Text — primary   | username `text-sm font-medium` (`hidden sm:inline`) |
| Text — secondary | search icon + placeholder `text-muted-foreground` |
| Spacing          | bar `h-16 gap-3 px-4 lg:px-8`; search box `relative min-w-0 max-w-md flex-1`, input `h-10 pl-9`, icon `absolute left-3 size-4 -translate-y-1/2`; right cluster `ml-auto gap-1.5`, account `gap-2.5 border-l border-border pl-3` |
| Hover state      | default ghost Button hover |
| Shadow           | none |
| Accent usage     | avatar fallback `bg-primary text-primary-foreground size-9`; icon buttons `size-10` (40px hit target, ui-rules.md) |

**Pattern notes:** Quick search is a **decorative placeholder** until a feature wires it (build-plan 0.C.1) — `type="search"` + `aria-label`, no state. Icon-only controls (menu, collapse toggle, bell) all get `size-10` + `aria-label`. Avatar initials derive from `fullName` (first letters of first two words, e.g. `System Administrator` → `SA`), falling back to username. Username text hides below `sm`; the avatar badge remains.

### DemoAccountsCard

File: `apps/web/src/features/auth/components/demo-accounts-card.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-card` (Card primitive) |
| Border           | Card ring (`ring-1 ring-foreground/10` from primitive) |
| Border radius    | `rounded-xl` (Card primitive) |
| Text — primary   | `text-sm font-medium` username |
| Text — secondary | `text-xs text-muted-foreground` label + password |
| Spacing          | label `px-4 pt-3 pb-2`; rows `px-4 py-2.5`; `divide-y divide-border` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:** Section label `text-xs font-medium uppercase tracking-wide text-muted-foreground` (matches the table-header style from ui-rules.md § Typography Scale). Password rendered in `font-mono text-xs` per the reference screenshots' mono password styling. Hardcoded copy of the two seed accounts; renders `null` when `process.env.NODE_ENV === "production"` (build-plan 0.B.2 dev-only gate). Label next to username is decorative flavor only — never a stored role (invariant #31).

### SignInForm

File: `apps/web/src/features/auth/components/sign-in-form.tsx`
Last updated: 2026-08-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | none (transparent — sits on the `bg-card` panel) |
| Border           | none |
| Border radius    | n/a |
| Text — primary   | `text-2xl font-bold` heading |
| Text — secondary | `text-sm text-muted-foreground` subtext |
| Spacing          | form `w-full max-w-sm`; fields `mt-6 space-y-1.5` / `mt-4 space-y-1.5`; button `mt-6 h-10 w-full` |
| Hover state      | default Button hover (`hover:bg-primary/80`) |
| Shadow           | none |
| Accent usage     | primary button `bg-primary text-primary-foreground`; error box `border-destructive/40 bg-destructive/10 text-destructive` |

**Pattern notes:** Every field pairs a visible `Label` (htmlFor/id) with the input — placeholder-as-label is forbidden (ui-rules.md). Inputs get `h-10 pl-9` (user icon slot). Error readout: `role="alert"`, `flex items-center gap-2`, `CircleAlert size-4`. Submit button shows `LoaderCircle animate-spin` + "Signing in…" while pending.

## Icon Set

Use `lucide-react` throughout (already an approved dependency per
`fullstack-architecture-plan.md`). Recurring icons observed: `LayoutGrid`
(Dashboard), `Users` (People/User Management), `IdCard`/`FileStack` (Local
Licenses), `ShieldCheck` (International Licenses), `RotateCcw`/`RefreshCw` (Renew), `FileWarning` (Damaged
replacement), `FileX` (Lost replacement), `Car` (Drivers & History),
`Wrench`/`Gavel`/`Shield` (Detain), `Unlock` (Release), `Settings2` (System
Configuration), `Search`, `Bell`, `Pencil`, `Trash2`, `Key`, `User` (username
field), `Lock` (password field / Locked appointment badge), `Eye`/`EyeOff`
(password visibility toggle), `CircleCheck` (Passed/Completed), `Award`
(license issued).

## Do Not

- Do not build a second table component with different padding/typography —
  every list screen uses `DataTable`.
- Do not put a raw `<select>` where the reference shows a searchable
  combobox (Link to Person, Select a citizen, driver picker) — those are
  explicitly type-to-filter in the source screens.
- Do not skip the description line under a modal title — every modal in the
  reference has one and it's load-bearing (it states the fee, or the
  consequence of the action, e.g. the lock warning in "Record Test Result").
- Do not build "Detain a License" as a modal — the reference shows it as a
  permanent inline form card, not a dialog. Do not build Renewals &
  Replacements as a driver-picker-then-modal flow — the reference shows a
  flat register table with per-row action buttons instead.
- Do not add a page-level "Save" button to System Configuration — the
  reference's own subtitle ("apply immediately") specifies autosave-per-field.
- Do not render a role/permission label anywhere outside `DemoAccountsCard`,
  and never persist or check that label — see `architecture.md` invariant #31.
