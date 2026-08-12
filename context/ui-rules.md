# ui-rules.md

## Layout Grid Rules

- Sidebar: fixed width, ~`260px` desktop, becomes an off-canvas drawer below
  `md`. Never let it push content into horizontal scroll.
- Content area: `max-w-screen-2xl`, horizontal padding scales
  `px-4` (mobile) → `px-8` (`lg+`).
- Dashboard `StatCard` row: `grid-cols-1` (mobile) → `grid-cols-2` (`sm`) →
  `grid-cols-4` (`lg`).
- `TwoColumnDetailLayout` (application/driver detail pages): single stacked
  column below `lg`, left summary card fixed ~`360px` / right card flexible
  at `lg` and above.
- Modals (`FormModal`): `max-w-lg` for simple forms (Add Person, Update
  Password), `max-w-xl` for forms with denser content (Issue License with
  notes, Create User Account with a combobox).
- `AuthSplitScreen`: exactly two equal-width columns at `lg` and above; below
  `lg` the left brand panel is dropped entirely (not stacked above) and the
  right form panel becomes the full-width page — the brand panel is
  decorative, not informational content a small-screen user needs to scroll past.
- Detain & Release page: `grid-cols-1` below `lg`, `grid-cols-[360px_1fr]`
  (form card / register table) at `lg` and above — same split ratio as
  `TwoColumnDetailLayout`.

## Responsive Breakpoints (Tailwind defaults — do not redefine)

| Breakpoint | Width | Behavior |
|---|---|---|
| (base) | <640px | Single column everywhere, sidebar becomes a drawer, tables scroll horizontally inside a bounded container rather than breaking layout |
| `sm` | ≥640px | `StatCard`s go 2-up |
| `md` | ≥768px | Sidebar becomes persistent/pinned |
| `lg` | ≥1024px | `StatCard`s go 4-up, `TwoColumnDetailLayout` splits into two columns |
| `xl` / `2xl` | ≥1280/1536px | Content area reaches its `max-w-screen-2xl` cap, extra space is margin not stretched content |

## Status Color Mapping (`StatusPill`)

Always pair color with text/icon — never color alone (accessibility, see
below).

| Meaning | Token | Examples |
|---|---|---|
| Success / good state | `success` (green) | Passed, Completed, Active, In Good Standing |
| Attention / pending | `warning` (amber) | New, Scheduled, Pending, In Progress |
| Negative / stop | `destructive` (red) | Failed, Inactive, Expired, Detained, Has Detained License |
| Neutral / locked | `muted` (gray) + `Lock` icon | Locked appointment rows |

## Accessibility Mandates

- Never convey state through color alone — every `StatusPill` carries text
  (and, for Locked/Passed/Failed, an icon too).
- Every form input has a visible, associated `<label>` (`htmlFor`/`id`
  pairing) — no placeholder-as-label.
- Modals (`Dialog`): trap focus while open, close on `Escape` and on
  backdrop click, return focus to the trigger element on close.
- All interactive icon-only buttons have an `aria-label` and a minimum
  40×40px hit target, even if the visual icon is smaller.
- Focus states use the `--ring` token (visible outline), never removed via
  `outline-none` without a replacement.
- Color contrast for all token pairs (`foreground` on `background`,
  `primary-foreground` on `primary`, etc.) must meet WCAG AA — verify any new
  token combination before shipping it.
- Destructive actions (delete person, delete user, cancel application,
  detain a license) always require a confirmation step — never fire on a
  single click.
- **Disabled actions must explain why, not just look inert.** When
  `LicenseRegisterTable`'s Renew/Damaged/Lost buttons are disabled for a
  detained license, they still render (never `display: none`) with reduced
  opacity, `aria-disabled="true"`, and a `title`/tooltip stating the reason
  ("Release this license before renewing or replacing it") — a user should
  never have to guess why an action is unavailable.
- **Autosave inputs need an explicit save signal.** `InlineEditableConfigTable`
  has no page-level Save button, so each field must announce its own
  save-success/failure — a brief visual cue (e.g. a checkmark that fades, or
  a momentary border color change) *and* a corresponding `aria-live="polite"`
  status update, so the confirmation isn't sighted-only.

## Typography Scale

| Use | Class |
|---|---|
| Page title (`PageHeader` h1) | `text-2xl font-bold` |
| Page description | `text-sm text-muted-foreground` |
| Card / section title | `text-lg font-semibold` |
| Table header | `text-xs font-medium text-muted-foreground uppercase tracking-wide` |
| Table cell (primary) | `text-sm font-medium` |
| Table cell (secondary, e.g. National No. under a name) | `text-xs text-muted-foreground font-mono` |
| Stat number (`StatCard`) | `text-3xl font-bold` |
| Body / form labels | `text-sm font-medium` |
| Monospace (IDs — `N-20348871`, `L-3`, `LIC-3`, `INT-1`) | `font-mono`, uses `--font-mono` |

## Table Rules

- Row hover: `hover:bg-muted/50`.
- Filter input always sits directly above the table, full width of the card.
- Pagination footer: record count + page indicator left, `Prev`/`Next`
  buttons right — disable `Prev` on page 1 and `Next` on the last page (don't
  just hide them).
- Empty result set: show `EmptyState`, never an empty table with just a
  header row.
- Long text (email, address) truncates with `text-ellipsis` + a native
  `title` attribute for the full value — never wraps and breaks row height.

## Dark Mode — Known Gap

The provided `globals.css` (`ui-tokens.md`) defines `@custom-variant dark
(&:is(.dark *))` but currently **only defines `:root` token values** — there
is no `.dark { ... }` override block yet. Do not ship a dark-mode toggle in
the UI until a `.dark` block with a full token set exists in `ui-tokens.md`.
If dark mode is requested before then, that's a `code-standards.md`/`ui-tokens.md`
update, not something to improvise per-component.
