# ui-registry.md

Every component below is observed directly in the reference screenshots.
Reuse these — don't invent a second pattern for something that already has
one here. All are built on shadcn/ui primitives (`components/ui/`) styled
with the tokens in `ui-tokens.md`.

| Component | Built on | Used in | Notes |
|---|---|---|---|
| `AppShell` | — (layout) | every authenticated page | Fixed dark sidebar (`bg-sidebar`, 288px bar → 64px icon rail when collapsed via `useUiStore`) + white topbar + light content area (`bg-background`, `max-w-screen-2xl`). Below `md` the sidebar becomes a `Sheet` off-canvas drawer. Sidebar groups: OVERVIEW, REGISTRY, APPLICATIONS HUB, OPERATIONS, each a small uppercase `text-sidebar-foreground/60` label. |
| `SidebarNavItem` | `Button` (ghost variant) | `AppShell` | Icon (lucide-react) + label. Active state: filled `bg-primary text-primary-foreground` rounded pill, matching the "Dashboard"/"People Management" active rows in the screenshots. Inactive: `text-sidebar-foreground`, hover `bg-sidebar-accent`. |
| `TopBar` | `Input`, `Avatar` | `AppShell` | Left: quick-search input with search icon, placeholder `"Quick search: national ID, license, driver..."`. Right: bell icon, `Avatar` (initials, e.g. "AM"), username text. |
| `PageHeader` | — | every list/detail page | `h1` title + one-line muted description below it. Primary action button (if any) is right-aligned on the same row (`+ Add Person`, `+ Create User`, `+ New Application`, `New International License`). |
| `StatCard` | `Card` | Dashboard | Label top-left, large number below it, icon top-right (muted), one-line description bottom-left, `"View →"` link bottom-right. Four of these in a `grid-cols-4` row on desktop. |
| `DataTable` | `Table` | People, Users, Applications, Drivers lists | Filter `Input` directly above the table. Header row: column labels, right-most column always "Actions" or "Manage". Footer: `"N records · Page X of Y"` left, `Prev`/`Next` buttons right. Row hover: subtle `bg-muted/50`. |
| `StatusPill` | `Badge` | everywhere a state is shown | See `ui-rules.md § Status Color Mapping` for the exact color per label. Always rounded-full, small text, colored background + matching text color, never color alone (see accessibility notes in `ui-rules.md`). |
| `IconActionButton` | `Button` (ghost, icon size) | table Action columns | Pencil (edit), Trash (delete, destructive-colored), Key (reset password). Minimum 40×40px hit target even though the icon itself is smaller. |
| `RolePill` | `Badge` (outline) | People Management "Roles" column | Small outline badges — "User", "Driver", "Citizen" — can stack multiple per row (see Marcus Reid: Driver + User). |
| `FormModal` | `Dialog` | Add/Edit Person, Create User, Update Password, New Application, Issue License, Release confirmation, Renew/Replace confirmation | Title (`text-lg font-semibold`) + one-line muted description directly under it. Form fields in a 2-column grid where fields pair naturally (First/Last Name, Date of Birth/Gender), single column otherwise. Footer right-aligned: `Cancel` (outline) then primary action (filled `bg-primary`). Top-right `X` close icon. **Not** used for Detain — that's an inline form card, see `DetainLicenseFormCard` below. |
| `Combobox` / searchable `Select` | shadcn `Command` + `Popover` | "Link to Person" picker, "Select a citizen" picker, driver picker | Type-to-filter list, each option formatted `Name (National-Number)`. **Reusable `SearchableCombobox<T>`** in `shared/components/` — reuse it, don't re-implement. Imprint: `searchable-combobox.tsx` (Session 10). |
| `AnnotatedSelect` | shadcn `Select` | License Class picker | Each option shows the constraint inline: `"Ordinary Driving License (Car) (Min age 18)"`. |
| `ToggleSwitch` | shadcn `Switch` | Users active/inactive | Paired immediately with a `StatusPill` (`Active`/`Inactive`) to the right of the switch — never the switch alone. Imprint: `users-list.tsx` (Session 10). |
| `TestPipelineStepper` | `Card` + custom row | Application detail page | Three stacked rows (session 5.2 — file `test-pipeline-card.tsx`). Exactly FOUR states (Session 14 contract, no Failed/Pending on stages): `Passed` — soft green card (`bg-success-tint`, `border-success/20`), green circular check, dark-green (`text-success-tint-foreground`) name + cost, soft green `Passed` pill (`bg-success/15`); `Scheduled` — white card, dark numbered circle (`bg-foreground text-primary-foreground`), amber `Scheduled <date>` pill (`bg-warning-tint text-warning-tint-foreground`) + primary `Record Result` button; `Schedule` — white card, dark numbered circle, `· N failed attempt(s)` count from history, outline `Schedule` button with calendar icon; `Locked` — muted gray card (`bg-muted`) with light gray numbered circle, muted text, gray `Locked` pill + lock icon (`bg-neutral-tint text-neutral-tint-foreground`). Buttons render disabled (with explanatory `title`) when the application is no longer New. |
| `AppointmentHistoryList` | `Card` + row list | Application detail page | Reverse-chronological (file `appointment-history-list.tsx`). Each row: `<Test Type> · <date>` left (examiner notes muted below when present), right: fee (`text-sm tabular-nums`) + outcome pills — EXACTLY 3 render cases: Pending (`bg-warning-tint text-warning-tint-foreground`), Passed (`bg-success/15 text-success-tint-foreground`) + Locked (`bg-neutral-tint text-neutral-tint-foreground`), Failed (`bg-destructive-tint text-destructive`) + Locked. No completed-date — appointment date shown for recorded rows too (Session 14 decision). Empty state: dashed-border box with calendar icon. |
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

### DataTable (PeopleList)

File: `apps/web/src/components/data-table.tsx` — consumed by `apps/web/src/features/people/components/people-list.tsx`
Last updated: 2026-08-13

| Property         | Class           |
| ---------------- | --------------- |
| Background       | container `bg-card`; filter bar transparent on card |
| Border           | container `border border-border`; filter bar + footer `border-t border-b border-border` |
| Border radius    | `rounded-xl` (container) |
| Text — primary   | name `text-sm font-medium`; National No. `font-mono text-sm`; body cells `text-sm` |
| Text — secondary | country/email `text-xs text-muted-foreground`; footer count `text-xs text-muted-foreground` |
| Spacing          | filter bar `p-4` (input `max-w-md h-10 pl-9`); table cell avatar block `gap-3`; footer `p-4`, buttons `gap-2` action cluster `gap-1` |
| Hover state      | rows `hover:bg-muted/50` (shadcn TableRow default) |
| Shadow           | `shadow-sm` |
| Accent usage     | avatar fallback `bg-primary/10 text-primary` (soft blue initials); delete icon `text-destructive` |

**Pattern notes:** Shared component extracted from the PeopleList implementation — every future list screen (Users, Applications, Drivers) renders `<DataTable>` with its own `columns` config, states, and empty node instead of copying this layout: filter input directly above the table, `overflow-x-auto` wrap for mobile, five-ish columns with Actions right-aligned (`justify-end`, `IconActionButton` size-10 ghost), footer with count/page left + Prev/Next right (both always rendered, disabled at edges). Loading = skeleton rows; error = centered retry; empty = `EmptyState` (icon + message) — never a bare header row. Filter debounce 300ms and page reset on filter commit stay in the feature component. People-specific rows: avatar initials from first two name words (`bg-primary/10 text-primary`), age computed client-side `"X yrs · Gender"`, contact stacked phone/email with truncate + `title`.

### PersonFormModal (AddPersonModal / EditPersonModal)

File: `apps/web/src/features/people/components/add-person-modal.tsx`, `edit-person-modal.tsx`, `person-form-fields.tsx`
Last updated: 2026-08-13

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden` |
| Text — primary   | title `text-lg font-semibold`; labels `text-sm font-medium` (Label) |
| Text — secondary | subtitle `text-sm text-muted-foreground`; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; grid `px-6 py-4 space-y-4`; field rows `space-y-1.5`, two-col `grid-cols-1 sm:grid-cols-2 gap-4`; footer `px-6 py-4` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | primary action `bg-primary text-primary-foreground`; submit spinner `LoaderCircle animate-spin` |

**Pattern notes:** First FormModal implementation — the template every Add/Edit modal follows: `DialogContent` `max-w-[550px] gap-0 overflow-hidden rounded-xl p-0`, title + one-line description (ui-registry FormModal rule), a `<form>` wrapping the field grid, then `DialogFooter` `border-t bg-background px-6 py-4` with right-aligned `Cancel` (outline, `bg-card h-10`) + primary `h-10`. Forms use react-hook-form + zod (library-docs §9): the schema mirrors the backend DTO (incl. `/^N-\d{8}$/`); RHF `register` for inputs, `Controller` for Selects (Gender, Country); errors render under each field from the resolver with `role="alert"`. DOB is a native `type="date"` input, native picker indicator hidden, single `CalendarIcon` absolutely right. Country select is a curated list (`features/people/countries.ts`), Add defaults "United States". Server errors surface in a `role="alert"` box (`border-destructive/40 bg-destructive/10 text-destructive` + `CircleAlert`) via `getApiErrorMessage` (`shared/lib/api-errors.ts`). Submit buttons show spinner + "Adding…"/"Saving…" while pending; on success the modal closes and the mutation's `invalidateQueries` refreshes the lists.

### UserStatusCell (ToggleSwitch + StatusPill pair)

File: `apps/web/src/features/users/components/users-list.tsx`
Last updated: 2026-08-13

| Property         | Class           |
| ---------------- | --------------- |
| Background       | none (sits in a DataTable cell) |
| Border           | none |
| Border radius    | pill via `Badge` (`rounded-4xl` from primitive) |
| Text — primary   | pill label `text-xs font-medium` (Badge) |
| Text — secondary | "(you)" tag `text-xs text-muted-foreground` |
| Spacing          | cell cluster `flex items-center gap-2.5`; pill `px-2 py-0.5` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | Active pill `bg-success/10 text-success`; Inactive pill `bg-destructive/10 text-destructive`; checked Switch = `bg-primary` (primitive) |

**Pattern notes:** The switch and pill are ONE cell and always render together — the switch carries the action, the pill carries the state text (ui-rules.md: never color alone). Session 10 decision: NOT optimistic — the row's switch disables while that row's mutation is in flight (`togglingId` per-row pending, since a mutation hook's global `isPending` can't distinguish rows) and the pill re-reads `isActive` on invalidation. Pill classes override the Badge default via tailwind-merge (bg/text groups), matching the DeletePersonDialog destructive-badge treatment. Add any future status-pair (e.g. Detained) in the same shape with the ui-rules mapping's token.

### LocalLicenseApplicationsList (4.2 DataTable usage)

File: `apps/web/src/features/local-license-applications/components/local-license-applications-list.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared DataTable (`bg-card`) |
| Border           | handled by shared DataTable (`border-border`) |
| Border radius    | handled by shared DataTable (`rounded-xl`) |
| Text — primary   | App No. `font-mono text-sm font-bold`; applicant name `text-sm font-bold`; cell body `text-sm` |
| Text — secondary | national number `font-mono text-xs text-muted-foreground`; progress fraction `text-sm tabular-nums` |
| Spacing          | progress cluster `flex items-center gap-3`; bar `h-1.5 w-24` |
| Hover state      | shared DataTable row hover `bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | progress fill `bg-primary` / track `bg-muted`; Status pill `bg-warning/10 text-warning` (New), `bg-success/10 text-success` (Completed), `bg-destructive/10 text-destructive` (Cancelled); Manage `Button variant="outline"` `h-10 bg-card` |

**Pattern notes:** First Applications-list consumer of the shared DataTable — six columns (App No., Applicant, Class, Test Progress, Status, Manage) with Manage right-aligned (`text-right` header + cell, same treatment as the Actions column). Test Progress is a PLACEHOLDER (Features 5 owns pipeline state): slim `bg-primary` track on `bg-muted`, fraction "0/3" hardcoded until 5.2. Status pill reuses the exact soft-tinted Badge classes from UserStatusCell (ui-rules § Status Color Mapping: New=warning/amber, Completed=success/green, Cancelled=destructive/red) — color + label, never alone. App No. rendered `L-{applicationId}` in mono+bold. "Open →" = outline Button with text "Open" + `ArrowRight` icon navigating via `useRouter`.

### NewLocalApplicationModal (FormModal + Combobox/AnnotatedSelect)

File: `apps/web/src/features/local-license-applications/components/new-local-application-modal.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden`; content `max-w-lg` (~500px spec) |
| Text — primary   | title `text-lg font-semibold`; labels `text-sm font-medium` (Label) |
| Text — secondary | subtitle `text-sm text-muted-foreground`; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; fields `px-6 py-4 space-y-4`; field rows `space-y-1.5`; footer `px-6 pt-5 pb-6` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | primary action `bg-primary text-primary-foreground`; submit spinner `LoaderCircle animate-spin`; combobox selection check `text-primary` |

**Pattern notes:** Second FormModal implementation (PersonFormModal is the template — identical chrome: DialogContent `gap-0 rounded-xl p-0`, title + MUST-HAVE description line, form wrapping grid + `DialogFooter border-t bg-background px-6 pt-5 pb-6`, right-aligned `Cancel` outline + primary `h-10`). The description line carries the live fee notice: "Application fee: $X. Minimum age is enforced per license class." — X read from `/lookup/application-types` (NewDrivingLicense row via lookupKeys, never hardcoded — invariant #28). Two-field form: Applicant = `SearchableCombobox<PersonDto>` via `Controller` (feed = `useCitizenOptions`, a page-1/pageSize-1000 ride on GET /people until a dedicated options endpoint exists), License Class = `Select` with `AnnotatedSelect` labels `"{className} (Min age {minimumAllowedAge})"` from `/lookup/license-classes` — pending → trigger disabled + "Loading classes…" placeholder, error → inline `Try again` link. Zod schema `{ personId, licenseClassId }` both `int().positive()` mirroring the backend DTO; 400 underage / 404 messages surface in the standard `role="alert"` destructive box. Close icon "X" top-right from the Dialog primitive.

### LocalLicenseApplicationDetailPage (TwoColumnDetailLayout first implementation)

File: `apps/web/src/features/local-license-applications/local-license-application-detail-page.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-card` (both cards) |
| Border           | header rows `border-b border-border`; card `border-border` (Card primitive) |
| Border radius    | `rounded-xl` (Card) |
| Text — primary   | title `text-2xl font-bold`; card title `text-lg font-semibold`; values `text-sm` |
| Text — secondary | `filed <date>` suffix `text-lg font-medium text-muted-foreground`; `App No.` `font-mono text-lg`; field labels `text-sm text-muted-foreground`; national number `font-mono text-xs`; back link `text-sm font-medium text-muted-foreground hover:text-foreground` |
| Spacing          | layout `gap-6 lg:grid-cols-[360px_1fr]`; card header `px-6 py-5`; content `px-6 py-5`; KV rows `space-y-4` (label/value `justify-between gap-4`); pipeline section divider `my-6 border-t border-border`; history rows `space-y-2` |
| Hover state      | back link `hover:text-foreground`; cancel `hover:bg-destructive-tint/70` |
| Shadow           | `shadow-sm` (Card) |
| Accent usage     | avatar `bg-primary/10 text-primary` (soft blue initials); Status pill tints: New `bg-warning-tint text-warning-tint-foreground`, Completed `bg-success/15 text-success-tint-foreground`, Cancelled `bg-destructive-tint text-destructive`; Cancel Application `bg-destructive-tint border-destructive/30 text-destructive`; disabled Issue CTA `bg-muted-solid text-primary-foreground` |

**Pattern notes:** 5.2 revision of the 4.2 shell. Page Action Header Bar: `← Back to Applications` Link (ArrowLeft, muted, `w-fit`) then H1 `Application L-{applicationId}` + inline muted `filed <date>`; Cancel Application only for New status (one-way door) as a tinted soft-red outline button. LEFT card: "Applicant" header, avatar + bold name + mono national number, `border-t` divider, then right-aligned KV rows (`<dl>` `<dt>` label / `<dd>` value — Status pill, License Class `font-semibold`, Application Fee snapshot, License Fee (on issue) read LIVE from `useLicenseClasses` — never hardcoded, invariant #28), footer CTA full-width: disabled = `bg-muted-solid` + white + "Issue License (pass all tests first)" + `title` explaining why (ui-rules disabled rule; Feature 6 wires the click), enabled = `bg-primary` "Issue License" — enabled only when every pipeline stage is Passed (invariant #22 mirror). RIGHT card: Test Pipeline header + exact spec subtitle, 3 stage rows (`TestPipelineCard`), divider, "Appointment History" h3 + rows (`AppointmentHistoryList`) — one container, two stacked sections per spec. Action affordances gated on `canAct` = status New. Loading = skeleton cards (incl. 3 skeleton stage bars); pipeline error = inline retry; page error = centered retry card.

### TestPipelineCard (4-state pipeline stepper)

File: `apps/web/src/features/local-license-applications/components/test-pipeline-card.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | Passed `bg-success-tint`; Scheduled/Schedule `bg-card`; Locked `bg-muted` |
| Border           | Passed `border-success/20`; others `border-border`; all `rounded-lg` rows `p-4` |
| Border radius    | `rounded-lg` rows; circles `rounded-full` (size-9) |
| Text — primary   | stage name `text-sm font-semibold` (Passed: `text-success-tint-foreground`; Locked: `text-muted-foreground`) |
| Text — secondary | cost/desc `text-xs text-muted-foreground`; Passed variant `text-success-tint-foreground/80`; attempt count `· N failed attempt(s)`; pills `text-xs font-medium` |
| Spacing          | rows `space-y-3`; icon cluster `items-center gap-3`; right cluster `gap-2` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | Passed circle `bg-success text-success-foreground` (CircleCheck); current circle `bg-foreground text-primary-foreground` (number); Locked circle `bg-muted-foreground/25 text-muted-foreground`; Passed pill `bg-success/15 text-success-tint-foreground`; Scheduled pill `bg-warning-tint text-warning-tint-foreground`; Locked pill `bg-neutral-tint text-neutral-tint-foreground` + Lock icon; Record Result `bg-primary h-9`; Schedule `variant="outline" h-9 bg-card` + Calendar icon |

**Pattern notes:** Render-only (server-computed states, invariant #9). EXACTLY 4 states (Session 14) — no Failed/Pending on stages; retake attempt count derived from `pipeline.history` (failed rows for the same testTypeId), never from the stage. Buttons disabled with explanatory `title` when `canAct` false (dead application — ui-rules disabled-state rule); Scheduled row's Record button also disables without `appointmentId`. Number badge = stage position 1..3.

### AppointmentHistoryList (history rows)

File: `apps/web/src/features/local-license-applications/components/appointment-history-list.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | rows `bg-card`; empty box dashed `border-border` |
| Border           | rows `border border-border` `rounded-lg` `px-4 py-3`; empty `border-dashed` |
| Border radius    | `rounded-lg` rows; pills `rounded-full` |
| Text — primary   | `[Test] · [date]` `text-sm font-medium` (`truncate`); fee `text-sm tabular-nums` |
| Text — secondary | notes `text-xs text-muted-foreground` (`truncate` + `title`); pills `text-xs font-medium` |
| Spacing          | list `space-y-2`; row `justify-between gap-4`; pill cluster `gap-2` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | Pending `bg-warning-tint text-warning-tint-foreground`; Passed `bg-success/15 text-success-tint-foreground`; Failed `bg-destructive-tint text-destructive`; Locked `bg-neutral-tint text-neutral-tint-foreground` — color + label never alone |

**Pattern notes:** Three render cases only (pending / passed+locked / failed+locked; Session 14 contract). Recorded rows show the APPOINTMENT date, not a completed date (deliberate — no result-date exists). Served newest-first, rendered as-is.

### ScheduleAppointmentModal

File: `apps/web/src/features/local-license-applications/components/schedule-appointment-modal.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden`; content `max-w-[480px]` (~480px spec) |
| Text — primary   | title `text-lg font-semibold`; labels `text-sm font-medium` (Label) |
| Text — secondary | subtitle `text-sm text-muted-foreground`; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; fields `px-6 py-4 space-y-4`; footer `px-6 pt-5 pb-6` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | primary action `bg-primary text-primary-foreground`; submit spinner `LoaderCircle animate-spin`; CalendarIcon `text-muted-foreground` right |

**Pattern notes:** Fourth FormModal implementation (PersonFormModal template). Subtitle carries the LIVE booking fee for the stage's test type via `useTestTypes` (invariant #28 — never hardcoded; pending → "Booking fee: —."). Single field: native date input with the exact DOB calendar treatment (`showPicker()` fallback, stretched hidden indicator, single CalendarIcon). 409s (double-booking, predecessor gate #19, dead application) surface verbatim in the standard alert box; dialog stays open.

### RecordResultModal

File: `apps/web/src/features/local-license-applications/components/record-result-modal.tsx`
Last updated: 2026-08-18

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden`; content `max-w-[480px]` (~480px spec) |
| Text — primary   | title `text-lg font-semibold`; labels `text-sm font-medium` (Label) |
| Text — secondary | subtitle `text-sm text-muted-foreground`; textarea placeholder "Observations, score, remarks..."; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; fields `px-6 py-4 space-y-4`; textarea `min-h-24`; footer `px-6 pt-5 pb-6` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | primary action `bg-primary text-primary-foreground`; submit spinner `LoaderCircle animate-spin` |

**Pattern notes:** The description line is the EXACT lock warning from the spec — "Saving a result permanently locks this appointment. A failed test requires a new appointment." — load-bearing copy (ui-registry Do Not list) mirroring invariants #20/#21. Result = shadcn `Select` with the backend's `passed`/`failed` vocabulary; zod enum validates, RHF errors under field. Notes optional, `MaxLength(500)` mirror. Submit sends `{ appointmentId, dto }` to `useRecordTestResult(applicationId)`; 409 stay-open pattern; "Save & Lock" label only while idle (spinner "Saving…" while pending).

### Combobox (Link to Person)

File: `apps/web/src/shared/components/searchable-combobox.tsx` (usage example: `apps/web/src/features/users/components/create-user-account-modal.tsx`)
Last updated: 2026-08-13

| Property         | Class           |
| ---------------- | --------------- |
| Background       | trigger `bg-card` (outline Button); popover `bg-popover` (Command) |
| Border           | trigger `border-input` (Button outline variant); popover `ring-1 ring-foreground/10` (primitive) |
| Border radius    | `rounded-lg` (primitive) |
| Text — primary   | selected option `text-sm font-normal` on trigger; option name `text-sm` |
| Text — secondary | trigger placeholder `text-muted-foreground`; option national no. `font-mono text-xs text-muted-foreground`; CommandEmpty `text-sm` |
| Spacing          | trigger `h-10 w-full justify-between`; popover `w-[var(--radix-popover-trigger-width)]`; options `px-2 py-1.5 gap-2` (CommandItem) |
| Hover state      | option `data-selected:bg-accent` (soft-blue selection, spec) |
| Shadow           | `shadow-md` (PopoverContent primitive) |
| Accent usage     | selection check `Check` `text-primary`, `opacity-100`/`opacity-0` on match |

**Pattern notes:** First Combobox implementation, refactored Session 10 into a reusable generic (**`SearchableCombobox<T>`** in `shared/components/`, same placement logic as the shared DataTable): a feature hook (`useUnlinkedPeople`) feeds the FULL non-paginated option set (people/unlinked contract — a page window would hide options) and the component owns the dropdown + type-to-filter UX. Props: `options`/`isPending`/`isError`/`onRetry` (feed state), `getOptionKey`/`getOptionLabel`/`getOptionSecondary?` (rendering + identity — check marker compares keys, never reference equality, so a re-fetched array still highlights the pick), `triggerPlaceholder`/`searchPlaceholder`/`loadingMessage`/`errorMessage`/`emptyMessage`/`noMatchMessage(search)` (copy), `value: T | null`/`onValueChange(value: T | null)` (the owner keeps only the id it needs — the 2.2 modal stores `personId`), `id` for Label pairing, `invalid` mirrored as `aria-invalid`. Internals: `PopoverTrigger asChild > Button variant="outline"` with `role="combobox"` + `aria-expanded`, `PopoverContent align="start"` sized to the trigger width, `Command > CommandInput + CommandList`; selection commits immediately, closes the popover, and clears the search; the search also resets on ANY close (escape/outside click) so a stale filter never reopens. Three feed states inside the list: pending (spinner row), error (retry link, `role="alert"`), and `CommandEmpty` distinguishing "no match" from "no options at all". The trigger shows `Label (Secondary)` for the selection; option rows show label + mono secondary + trailing check. Future pickers (Select a citizen, driver picker) use this component — do not re-implement the dropdown.

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
