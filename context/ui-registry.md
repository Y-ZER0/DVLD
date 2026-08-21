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
| `ConfirmationBanner` | inline (not a `Card`) | post-issuance state on detail pages | Light-green rounded box with a check/award icon, bold headline (`"License LIC-3 issued"`), muted subtext (`"Valid 2026-08-11 to 2036-08-11"`). Replaces the action button once the action is complete — never shown alongside a still-active action button for the same thing. Imprint: `applicant-card.tsx` footer (Session 17). |
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

**Pattern notes:** Shared component extracted from the PeopleList implementation — every future list screen (Users, Applications, Drivers) renders `<DataTable>` with its own `columns` config, states, and empty node instead of copying this layout: filter input directly above the table, `overflow-x-auto` wrap for mobile, five-ish columns with Actions right-aligned (`justify-end`, `IconActionButton` size-10 ghost), footer with count/page left + Prev/Next right (both always rendered, disabled at edges). Loading = skeleton rows; error = centered retry; empty = `EmptyState` (icon + message) — never a bare header row. Filter debounce 300ms and page reset on filter commit stay in the feature component. People-specific rows: avatar initials from first two name words (`bg-primary/10 text-primary`), age computed client-side `"X yrs · Gender"`, contact stacked phone/email with truncate + `title`. **Session 19 extension:** optional `header?: ReactNode` (section-title block inside the card, `border-b px-4 pt-4 pb-3`) and `showSearch?: boolean` (default `true`; `false` hides the filter bar — used by the 7.2 license register, which is paginated without search per Session 18 decision). Both defaults keep every older consumer unchanged.

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

### IssueLicenseModal (6.2 issuance confirmation)

File: `apps/web/src/features/local-license-applications/components/Modals/issue-license-modal.tsx`
Last updated: 2026-08-19

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden`; content `max-w-[480px]` (~480px spec) |
| Text — primary   | title `text-lg font-semibold`; labels `text-sm font-medium` (Label) |
| Text — secondary | subtitle `text-sm text-muted-foreground`; textarea placeholder "First time issuance."; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; fields `px-6 py-4 space-y-4`; textarea `min-h-24`; footer `px-6 pt-5 pb-6` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | primary action `bg-primary text-primary-foreground` + `Award` icon (ribbon/badge per spec); submit spinner `LoaderCircle animate-spin` |

**Pattern notes:** Fifth FormModal implementation (PersonFormModal template). Subtitle carries the FULL spec sentence with live values: "Issue a {ClassName} license to {Applicant}. Fee: ${ClassFees}. If the applicant is not yet a driver, a driver record is created automatically." — the fee read live via `useLicenseClasses` (invariant #28), the driver-record sentence is the front-end face of invariant #23 (one transaction). Single field: Notes textarea, placeholder = FirstTime issue-reason copy (7.x renewal/replacement modals will vary it), `MaxLength(500)` mirror. On success the mutation invalidates `detail(id)` + `lists()` (status → Completed everywhere, invariant #6) and the returned `LicenseDto` rides up via `onIssued` — the page renders the banner from server truth, no second fetch. 409s (pipeline gate #22, dead application, active same-class license #26) surface verbatim in the standard alert box; dialog stays open. `useIssueLicense(applicationId)` ships without the build-plan's drivers-list invalidation — no `driversKeys` exist until Feature 10 (Session 17 note).

### ApplicantCard footer states (6.2 post-issuance)

File: `apps/web/src/features/local-license-applications/components/Left-Column/applicant-card.tsx`
Last updated: 2026-08-19

| Property         | Class           |
| ---------------- | --------------- |
| Background       | banner container `bg-success-tint` (#F0FDF4 per spec) |
| Border           | banner `border border-success/20` (#DCFCE7-family light green) |
| Border radius    | `rounded-lg` (banner) |
| Text — primary   | headline `text-sm font-bold text-success` (#059669 per spec) + `Award` icon; license id `font-mono` (`LIC-{id}`, ui-rules ID rule) |
| Text — secondary | validity `text-sm text-muted-foreground` ("Valid {issueDate} to {expirationDate}", raw YYYY-MM-DD from the date columns) |
| Spacing          | banner `p-4`; headline cluster `gap-2`, validity `mt-1` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | `Award` `text-success` (dark green icon); CTA variants unchanged from 5.2 |

**Pattern notes:** THREE footer cases, not two: (1) `issuedLicense` state present → full banner "License LIC-N issued / Valid a to b"; (2) application status `Completed` WITHOUT local license state (page refreshed after a success) → banner minus fabricated specifics, so a re-issued CTA is never offered past the 6.1 one-way door; (3) otherwise the 5.2 two-state CTA (disabled `bg-muted-solid` why-label / enabled `bg-primary`), the enabled variant now wired to the issuance modal. Banner replaces the button entirely (ui-registry ConfirmationBanner rule — never alongside a live CTA).

### LicenseRegisterTable (7.2 renewals register)

File: `apps/web/src/features/renewals-replacements/components/license-register-table.tsx`
Last updated: 2026-08-19

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared DataTable (`bg-card`); section header sits on the card surface |
| Border           | handled by shared DataTable (`border-border`) |
| Border radius    | handled by shared DataTable (`rounded-xl`) |
| Text — primary   | License `font-mono text-sm font-bold` (`LIC-{id}`); driver name `text-sm font-bold`; section header `text-lg font-semibold` |
| Text — secondary | national number `font-mono text-xs text-muted-foreground`; Issued/Expires `text-sm tabular-nums` |
| Spacing          | section header `px-4 pt-4 pb-3`; action cluster `flex items-center justify-end gap-1` |
| Hover state      | shared DataTable row hover `bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | Active pill `bg-success/10 text-success`; Detained pill `bg-destructive/10 text-destructive`; Inactive pill `bg-neutral-tint text-neutral-tint-foreground`; action buttons `variant="outline" size="icon"` + `size-10` |

**Pattern notes:** First DataTable consumer without a filter input (Session 18 decision: register is paginated, no search) — DataTable gained the optional `header` + `showSearch` props (edit above). Status = THREE pills, not two — the register includes deactivated rows for the audit trail (10.1 reuse): Active green, Detained destructive red, Inactive neutral gray (`bg-neutral-tint`, archived/locked semantics visually distinct from Detained red — deliberate deviation from ui-rules' blanket "Inactive→destructive" listing). All three action buttons (Renew `RefreshCw`, Damaged `FileWarning`, Lost `FileX`) are outline icon buttons with `aria-label`s and disable TOGETHER when the row is detained OR inactive: native `disabled` + `title` explaining why + `disabled:cursor-not-allowed [&:disabled]:pointer-events-auto` (re-enables hover so the title/cursor actually surface — the base button's `pointer-events-none` would hide the reason, violating ui-rules' "never guess why" rule). Detained title = "Release this license before renewing or replacing it" (invariant #32 mirror); inactive = "This license is no longer active." (server 409s the action anyway). Dates formatted `[DD Mon YYYY]` via en-GB `Intl.DateTimeFormat` with a local-midnight parse of the YYYY-MM-DD column. Reason labels per `IssueReason`: First Time / Renewed / Damaged / Lost. One `pendingAction { license, action }` state opens exactly one modal at a time.

### RenewLicenseModal / ReplaceLicenseModal (7.2 per-action confirmations)

File: `apps/web/src/features/renewals-replacements/components/Modals/renew-license-modal.tsx`, `apps/web/src/features/renewals-replacements/components/Modals/replace-license-modal.tsx`
Last updated: 2026-08-19

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden`; content `max-w-[480px]` (~480px spec) |
| Text — primary   | title `text-lg font-semibold`; labels `text-sm font-medium` (Label) |
| Text — secondary | subtitle `text-sm text-muted-foreground`; textarea placeholders "Renewal of license." / "Replacement for damaged license." / "Replacement for lost license."; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; fields `px-6 py-4 space-y-4`; textarea `min-h-24`; footer `px-6 pt-5 pb-6` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | primary action `bg-primary text-primary-foreground` + `RefreshCw` (renew) / `FileWarning` (damaged) / `FileX` (lost); submit spinner `LoaderCircle animate-spin` |

**Pattern notes:** Sixth/seventh FormModal implementations (PersonFormModal template). The description line is load-bearing consequence copy per build-plan 7.2: names the license being deactivated (`LIC-{id}` in `font-medium text-foreground` mono emphasis) and BOTH fees read live from lookup — application fee matched by `ApplicationType` title via `useApplicationTypes`, license fee matched by the row's `licenseClassId` via `useLicenseClasses` (invariant #28, never hardcoded; pending → "—"). Notes textarea `MaxLength(500)` mirror; placeholder = the issue-reason copy family (6.2's "First time issuance." precedent, varied per action). One `ReplaceLicenseModal` file serves BOTH replacement reasons via a `reason: 'damaged' | 'lost'` prop + a `REPLACE_META` record (title/copy/placeholder/icon) — no duplicated modal pair. Zod schemas `{ notes? }` mirror the backend DTOs; mutations bind the license id at hook call (`useRenewLicense(license.id)` / `useReplaceLicense(license.id)`) and invalidate `renewalsReplacementKeys.lists()` on success (old row flips to Inactive, new row appears — no success banner needed, unlike 6.2). 409s (open detention #32, not-active #26) surface verbatim in the standard `role="alert"` box; dialog stays open.

### InternationalLicensesTable (8.2 international register)

File: `apps/web/src/features/international-licenses/components/international-licenses-table.tsx`
Last updated: 2026-08-19

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared DataTable (`bg-card`) |
| Border           | handled by shared DataTable (`border-border`) |
| Border radius    | handled by shared DataTable (`rounded-xl`) |
| Text — primary   | License `font-mono text-sm font-bold` (`INT-{id}`); driver name `text-sm font-bold`; Based On `font-mono text-sm` (`LIC-{id}`); section header `text-lg font-semibold` |
| Text — secondary | national number `font-mono text-xs text-muted-foreground`; section subtitle `text-sm text-muted-foreground`; Issued/Expires `text-sm tabular-nums` |
| Spacing          | section header block `mt-0.5` between title/subtitle; card header `px-4 pt-4 pb-3` (DataTable `header` prop) |
| Hover state      | shared DataTable row hover `bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | Active pill `bg-success/10 text-success`; **Expired pill `bg-neutral-tint text-neutral-tint-foreground`** (soft gray per 8.2 spec — same treatment as 7.2's Inactive; deliberate deviation from ui-rules' Expired→destructive listing, flagged for sync); empty state `ShieldCheck` icon |

**Pattern notes:** Second DataTable consumer with `showSearch={false}` + `header` (Session 19 props, 7.2 precedent — paginated register, no filter). Six columns per spec (License, Driver, Based On, Issued, Expires, Status) — no Actions column (issuance action lives in the page header). Dates `[Mon DD, YYYY]` via en-US `Intl.DateTimeFormat` with local-midnight parse (spec format — differs from 7.2's en-GB `[DD Mon YYYY]`). **Status derived from dates, not `isActive`** — local-today YYYY-MM-DD string compare against `expirationDate` (nothing ever flips the column); Active green / Expired gray. Header block = `h2 text-lg font-semibold` + `p text-sm text-muted-foreground` subtitle ("Issued International Licenses" / "All international licenses on record, newest first." — spec copy). Empty state: `ShieldCheck` + "No international licenses issued yet" + hint that issued documents appear here. Page state: `useInternationalLicenses({ page, pageSize: 10 })` with `placeholderData` (7.2 pattern).

### IssueInternationalLicenseModal (8.2 issuance modal)

File: `apps/web/src/features/international-licenses/components/Modals/issue-international-license-modal.tsx`
Last updated: 2026-08-19

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-popover` (DialogContent); footer bar `bg-background` (#F8FAFC per spec); verification panel `bg-success-tint` (#F0FDF4 per spec) |
| Border           | `ring-1 ring-foreground/10` (primitive); footer `border-t border-border`; verification panel `border border-success/20` |
| Border radius    | `rounded-xl` (primitive) + `overflow-hidden`; content `max-w-[480px]` (~480px spec); panel `rounded-lg` |
| Text — primary   | title `text-lg font-semibold`; verification headline `text-sm font-bold text-success` (spec copy); fee amounts `text-sm font-medium tabular-nums` |
| Text — secondary | subtitle `text-sm text-muted-foreground` (exact spec sentence); fee row labels `text-sm text-muted-foreground`; field errors `text-xs font-medium text-destructive` |
| Spacing          | header `px-6 pt-6 pb-1`; fields `px-6 py-4 space-y-4`; field rows `space-y-1.5`; panel `p-4`, badge row `gap-2`, fee rows `space-y-2` + `justify-between`; footer `px-6 pt-5 pb-6` |
| Hover state      | n/a (dialog) |
| Shadow           | none (elevation via ring + `data-open:animate-in`) |
| Accent usage     | circular check `size-5 rounded-full bg-success text-success-foreground` (CircleCheck); verify icon + headline `text-success`; primary `bg-primary text-primary-foreground`; contact submit spinner `LoaderCircle animate-spin` |

**Pattern notes:** Eighth FormModal implementation (PersonFormModal template, `NewLocalApplicationModal` wiring). Subtitle = the EXACT spec sentence — "The system verifies the driver holds an active Ordinary Driving License (Class 3) before issuing." — the front-end face of invariant #24. Single field: Driver = `SearchableCombobox<InternationalEligibleDriverDto>` via RHF `Controller` (ui-registry combobox reuse — option rows "name + mono national number", trigger "Name (NN)"); feed = full 1000-window ride on `GET /drivers/eligible-for-international` (citizen-options precedent, 5-min staleTime); owner keeps only `driverId`. **Verification panel renders when `driverId` is set** (any selection is eligible ⇒ verified): circular green check + bold green "Verified: active Class 3 (Car) local license on file.", then `dl` fee rows — "Application Fee" = live `NewInternationalLicense` lookup fee (invariant #28) and "Validity" = "1 year from issue date" (fixed rule copy). Confirm button label = "Issue License · ${fee}" (— while lookup pending), `disabled` until verified (spec's disabled-when-unverified) or pending. 400/409s (ineligible driver, duplicate valid international) surface verbatim in the standard alert box; dialog stays open; on success invalidates `internationalLicensesKeys.lists()` only (eligible feed unchanged by issuance — driver keeps their Car license; register self-updates, no banner).

File: `apps/web/src/shared/components/searchable-combobox.tsx` (usage example: `apps/web/src/features/users/components/create-user-account-modal.tsx`)
Last updated: 2026-08-13

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

### DriverLookupCard

File: `apps/web/src/features/drivers/components/driver-lookup-card.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-card` (Card) |
| Border           | `border border-border` |
| Border radius    | `rounded-xl` (Card) |
| Text — primary   | title `text-base font-semibold`; input `text-sm` |
| Text — secondary | subtitle `text-sm text-muted-foreground`; search icon `text-muted-foreground` |
| Spacing          | card `p-6` `gap-4`; form `gap-3 sm:flex-row`; input `h-10 pl-9` |
| Hover state      | none (form card) |
| Shadow           | `shadow-sm` |
| Accent usage     | primary `Search` button `bg-primary text-primary-foreground` `h-10`; `Search` lucide `size-4` |

**Pattern notes:** Enterprise lookup card per Session 25 spec: white `rounded-xl border bg-card shadow-sm` container (`Card`/`CardContent`), `h2 text-base font-semibold` "Driver Lookup" + `text-sm text-muted-foreground` subtitle "Enter a National Number (e.g. N-30871234)…", then an inline `flex-col sm:flex-row` form: leading-icon `Input` (`Search` absolute `left-3 size-4 text-muted-foreground`, `h-10 pl-9`, placeholder "National ID, Driver ID, or name…") + solid primary `Search` button (`h-10 shrink-0`). Plain controlled `useState` + `useEffect` sync on `defaultValue` (search precedent — not RHF/zod, since there is no validation schema for an optional lookup term; follows DataTable filter + TopBar quick-search pattern). Submit trims and calls `onSearch`; parent lifts `searchTerm` (directory) or `router.push(/drivers?search=…)` (detail page — directory is the single switching surface). `?search=` pre-fill via async `searchParams` prop avoids `useSearchParams` Suspense bailout.

### DriverDirectoryTable (Registered Drivers)

File: `apps/web/src/features/drivers/components/driver-directory-table.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared `DataTable` (`bg-card`) |
| Border           | handled by shared `DataTable` (`border-border`) |
| Border radius    | handled by shared `DataTable` (`rounded-xl`) |
| Text — primary   | Driver ID `font-mono text-sm font-bold` (`DRV-{id}`); Name `text-sm font-bold`; header `text-lg font-semibold` |
| Text — secondary | email `text-xs text-muted-foreground` (truncate + `title`); national `font-mono text-sm`; licenses `text-sm tabular-nums`; subtitle `text-sm text-muted-foreground` |
| Spacing          | header block `flex flex-col gap-1`; DataTable footer `p-4` (shared) |
| Hover state      | shared DataTable row hover `hover:bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | In Good Standing `bg-success/10 text-success`; Has Detained License `bg-destructive/10 text-destructive`; View History `Button variant="outline" h-10 bg-card` |

**Pattern notes:** Drivers-directory DataTable (`showSearch={false}` + `header` — register precedent). Six columns per spec: Driver ID (`DRV-{id}` mono bold), Name (bold stacked above muted email with `truncate` + `title`), National Number (mono), Licenses (`N active / M total` tabular), Status (two-pill `Badge`: green vs red), Action right-aligned outline "View History" (`useRouter.push(/drivers/{id})`). Owns `page` state (`PAGE_SIZE=10`); switches between `useDrivers({page,pageSize})` and `useDriverSearch({search,page,pageSize})` via `isSearching` (trimmed length >0); `useEffect` resets `page` on `searchTerm` change so a narrow result set never strands page N. Header shows "All drivers on record. Select one…" normally, or `Showing results for "term" · Clear` when searching (clear button `text-primary underline-offset-4`). Empty: search miss (`No drivers match "term"` + retry `Clear search`) vs no drivers (`Drivers are created automatically…`).

### DriverProfileSummaryCard

File: `apps/web/src/features/drivers/components/driver-profile-summary-card.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-card` (Card) |
| Border           | `border border-border` |
| Border radius    | `rounded-xl` (Card) |
| Text — primary   | name `text-xl font-bold`; Driver ID `font-mono text-sm font-medium` (`DRV-{id}`) |
| Text — secondary | national `font-mono text-sm text-muted-foreground`; field labels `text-xs text-muted-foreground`; field values `text-sm font-medium` (truncate + `title`) |
| Spacing          | card `p-6 gap-6`; header `gap-4` (avatar + name); grid `grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4`; column `flex flex-col gap-5` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | avatar `size-12 bg-primary/10 text-primary` (AvatarFallback `bg-primary/10 text-sm font-bold text-primary` — 2-letter initials); skeleton `size-12 rounded-full` + `h-6 w-40`/`h-4 w-28` |

**Pattern notes:** Implements the `ProfileSummaryCard` spec row (ui-registry top table) — now the concrete `DriverProfileSummaryCard`. Header: soft-blue circular avatar (initials from first+last, `bg-primary/10 text-primary` — PeopleList avatar precedent) beside `h2 text-xl font-bold` name stacked above mono national number. Below: 4-column KV grid collapsing `1→2→4` cols at `sm`/`lg`; columns are `DoB/Email | Gender/Address | Phone/DriverID | Country/Since` per approved prompt. Each `Field` is label `text-xs text-muted-foreground` + `mt-1 text-sm font-medium truncate` value with native `title`; dates formatted `en-GB [DD Mon YYYY]` (`T00:00:00` parse for `dateOfBirth` DATE, direct `new Date(iso)` for `driverSince` timestamptz). `DriverProfileSummaryCardSkeleton` mirrors the structure (avatar + 8 field skeletons). Error/loading handled by the parent detail page (centered retry card).

### TabbedDetailView (Drivers detail — actual implementation)

File: `apps/web/src/features/drivers/drivers-detail-page.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | tab triggers active `bg-accent`; inactive `bg-muted`; panels `bg-card` (DataTable) |
| Border           | trigger `border-transparent` (Tabs primitive); panels `border-border` (DataTable Card) |
| Border radius    | triggers `rounded-full` (pill); panels `rounded-xl` (DataTable) |
| Text — primary   | active trigger `font-bold text-accent-foreground`; inactive `text-muted-foreground`; count `(n)` live |
| Text — secondary | page subtitle `text-sm text-muted-foreground` |
| Spacing          | page `gap-6`; tabs `gap-4`; `TabsList` `gap-2` `h-auto w-fit bg-transparent p-0`; triggers `px-4 py-1.5` |
| Hover state      | inactive `hover:bg-muted/80 hover:text-foreground` |
| Shadow           | active pill `shadow-sm`; panels `shadow-sm` |
| Accent usage     | active pill `bg-accent text-accent-foreground` (light-blue `#eff6ff` tint); inactive `bg-muted text-muted-foreground` soft gray |

**Pattern notes:** First `TabbedDetailView` implementation (ui-registry top table planned it; this is the concrete build). Uses shadcn `Tabs` (`components/ui/tabs.tsx` generated via `shadcn add tabs` — `radix-nova` `TabsPrimitive`, not hand-rolled) restyled via `className` only: `TabsList` is `bg-transparent p-0 h-auto w-fit gap-2`, each `TabsTrigger` is a pill `rounded-full px-4 py-1.5 text-sm font-medium` — active `bg-accent text-accent-foreground font-bold shadow-sm` (light-blue badge per prompt), inactive `bg-muted text-muted-foreground hover:bg-muted/80`. Three triggers with live counts: `Local Licenses (n)` / `International (n)` / `Test Log (n)` — counts are `rows.length` from the 4 independent queries (`useDriverSummary` + 3 history hooks, fire at page level per build-plan). Each `TabsContent` hosts its own `DataTable` (history tables below). State is `useState<HistoryTab>("local")` driven by `Tabs onValueChange`; triggers also carry `onClick` (redundant, kept for explicit intent). Detail lookup card submit navigates to `/drivers?search=term` (directory as the switching surface). Page footer: bottom-left outline "Back to all drivers" (`ArrowLeft` + `Button variant="outline" h-10 bg-card` inside `Link href="/drivers"`) per prompt. Loading = `DriverProfileSummaryCardSkeleton` + pill skeletons; error = centered `role="alert"` retry card (local-detail-page precedent). `?search=` pre-fill via async `searchParams` prop in both `app/(protected)/drivers/*` routes.

### LocalLicenseHistoryTable

File: `apps/web/src/features/drivers/components/local-license-history-table.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared DataTable (`bg-card`) |
| Border           | handled by shared DataTable (`border-border`) |
| Border radius    | handled by shared DataTable (`rounded-xl`) |
| Text — primary   | License `font-mono text-sm font-bold` (`LIC-{id}`); Class/Reason `text-sm`; header `text-lg font-semibold` |
| Text — secondary | subtitle `text-sm text-muted-foreground`; Issued/Expires `text-sm tabular-nums`; Fees `text-sm tabular-nums` |
| Spacing          | header `mt-0.5` between title/subtitle; DataTable `px-4 pt-4 pb-3` (header prop) |
| Hover state      | shared DataTable row hover `bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | Detained `bg-destructive/10 text-destructive`; Inactive `bg-neutral-tint text-neutral-tint-foreground`; Active `bg-success/10 text-success`; empty `IdCard size-8 text-muted-foreground` |

**Pattern notes:** Driver-scoped local-history DataTable (`showSearch={false}` + `header` — same DataTable extension as 7.2's `LicenseRegisterTable` that introduced these props). Seven columns per prompt exactly: License (`LIC-{id}` mono bold), Class, Issue Reason (`REASON_LABELS` 1→First Time/2→Renewed/3→Damaged/4→Lost — 7.2 precedent), Issued, Expires (`en-GB [DD Mon YYYY]` via `new Date(iso+"T00:00:00")`), Fees (`$` tabular), Status (three-pill reuse of 7.2 `licenseStatusFor`: Detained red / Inactive gray / Active green — `isDetained` comes from 10.1's `LicenseRegisterRowDto`). Parent passes `rows/isPending/isError/onRetry`; table itself sets `total=rows.length page=1 totalPages=1` (endpoint returns an array, no pagination — satisfies DataTable contract with `Page 1 of 1`). Empty: `IdCard` + "No local licenses on file".

### InternationalLicenseHistoryTable

File: `apps/web/src/features/drivers/components/international-license-history-table.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared DataTable (`bg-card`) |
| Border           | handled by shared DataTable (`border-border`) |
| Border radius    | handled by shared DataTable (`rounded-xl`) |
| Text — primary   | License `font-mono text-sm font-bold` (`INT-{id}`); Based On `font-mono text-sm` (`LIC-{id}`); header `text-lg font-semibold` |
| Text — secondary | subtitle `text-sm text-muted-foreground`; Issued/Expires `text-sm tabular-nums` |
| Spacing          | header `mt-0.5`; DataTable `px-4 pt-4 pb-3` |
| Hover state      | shared DataTable row hover `bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | Expired `bg-neutral-tint text-neutral-tint-foreground` (soft gray — 8.2 spec); Active `bg-success/10 text-success`; empty `ShieldCheck size-8 text-muted-foreground` |

**Pattern notes:** Driver-scoped international-history DataTable (same `showSearch={false}`+`header` pattern). Five columns — drops the redundant Driver column from Feature 8's `InternationalLicensesTable` (6 columns incl. Driver) because the page *is* the driver; this matches how the local tab drops Driver/National from 7.2's register. Columns: License `INT-{id}`, Based On `LIC-{id}`, Issued, Expires (`en-US [Mon DD, YYYY]` via `T00:00:00` parse — 8.2's format, not 7.2's en-GB), Status derived from dates (`expirationDate < todayIso()` → Expired gray vs Active green — same `todayIso()` YYYY-MM-DD string-compare contract as 8.2; `isActive` column is never trusted). Build-plan "same shape as Feature 8, filtered to this driver" deviation is the Driver-column omission — flagged for REVIEW.

### DriverTestLogTable

File: `apps/web/src/features/drivers/components/driver-test-log-table.tsx`
Last updated: 2026-08-21

| Property         | Class           |
| ---------------- | --------------- |
| Background       | handled by shared DataTable (`bg-card`) |
| Border           | handled by shared DataTable (`border-border`) |
| Border radius    | handled by shared DataTable (`rounded-xl`) |
| Text — primary   | Test `font-mono text-sm font-bold` (`TEST-{id}`); Stage/App `text-sm`; header `text-lg font-semibold` |
| Text — secondary | subtitle `text-sm text-muted-foreground`; Date `text-sm tabular-nums`; Notes `text-sm text-muted-foreground truncate` (`max-w-[220px]`) |
| Spacing          | header `mt-0.5`; DataTable `px-4 pt-4 pb-3`; Notes cell `block max-w-[220px] truncate` + `title` |
| Hover state      | shared DataTable row hover `bg-muted/50` |
| Shadow           | shared DataTable `shadow-sm` |
| Accent usage     | Passed `bg-success/10 text-success`; Failed `bg-destructive/10 text-destructive`; empty `ClipboardList size-8 text-muted-foreground` |

**Pattern notes:** Driver-scoped test-log DataTable (`showSearch={false}`+`header`). Seven columns (prompt left this open; spec chosen in ARCHITECT): Test `TEST-{testId}` mono bold, Stage (`testTypeTitle`), Date (`en-GB [DD Mon YYYY]` from `appointmentDate` ISO timestamptz via `new Date(iso)` — 9.2 detain-date precedent, not the `T00:00:00` DATE trick), Result pill (Passed green / Failed red — two-pill, unlike the three-pill license registers), Fees (`$` tabular), App `L-{applicationId}` mono, Notes (`truncate` + `title`, `—` when null). Newest-first is server-guaranteed (10.1 `test.id IS NOT NULL` + `newest first`); client renders as-is. `getRowId` is `testId`. Empty: `ClipboardList` + "No tests on file" hint.

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
