# ui-tokens.md

This file is the single source of truth for color, radius, and typography.
**Never hand-write a hex code or an arbitrary Tailwind value in a component.**
If a value isn't a token here, it doesn't exist yet — add it here first, then
use it.

## Source of Truth — `apps/web/src/app/globals.css`

This is the exact, authoritative file. Copy it verbatim into the project;
do not "improve" or restructure it.

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@custom-variant dark (&:is(.dark *));
@theme inline {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
:root {
  color-scheme: light;
  /* Neutral slate light background with white cards */
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  /* Sapphire blue for actions */
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #eff6ff;
  --accent-foreground: #1d4ed8;
  /* Semantic statuses */
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --success: #059669;
  --success-foreground: #ffffff;
  --warning: #d97706;
  --warning-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #2563eb;
  --chart-1: #2563eb;
  --chart-2: #059669;
  --chart-3: #d97706;
  --chart-4: #dc2626;
  --chart-5: #64748b;
  --radius: 0.5rem;
  /* Slate navy sidebar */
  --sidebar: #0f172a;
  --sidebar-foreground: #cbd5e1;
  --sidebar-primary: #2563eb;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #1e293b;
  --sidebar-accent-foreground: #f8fafc;
  --sidebar-border: #1e293b;
  --sidebar-ring: #2563eb;
}
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Required Packages & Setup

- `tailwindcss@^4`, `tw-animate-css`, shadcn CLI output (`@import
  'shadcn/tailwind.css'` implies the shadcn base layer is present — run
  `npx shadcn init` before pasting this file in, don't hand-roll it)
- Fonts loaded via `next/font/google` in the root `layout.tsx`:
  `Inter` → CSS var `--font-inter`, `JetBrains_Mono` → CSS var
  `--font-jetbrains-mono`. These feed `--font-sans`/`--font-mono` above.

## Token Reference

| Token | Hex (light) | Typical usage |
|---|---|---|
| `background` | `#f8fafc` | App content background |
| `foreground` | `#0f172a` | Default body text |
| `card` / `card-foreground` | `#ffffff` / `#0f172a` | `Card`, `Dialog`, `Table` surfaces |
| `primary` / `primary-foreground` | `#2563eb` / `#ffffff` | Primary buttons, active nav pill, links |
| `secondary` / `secondary-foreground` | `#f1f5f9` / `#0f172a` | Secondary buttons, subtle surfaces |
| `muted` / `muted-foreground` | `#f1f5f9` / `#64748b` | Disabled/quiet text, table headers, hover rows |
| `accent` / `accent-foreground` | `#eff6ff` / `#1d4ed8` | Hover/selected states, info callouts |
| `destructive` / `destructive-foreground` | `#dc2626` / `#ffffff` | Delete buttons, Failed/Expired/Inactive pills |
| `success` / `success-foreground` | `#059669` / `#ffffff` | Passed/Completed/Active pills, confirmation banners |
| `warning` / `warning-foreground` | `#d97706` / `#ffffff` | New/Scheduled/Pending pills |
| `success-tint` / `success-tint-foreground` | `#f0fdf4` / `#15803d` | Soft green card/pill surfaces — Passed stage cards, Passed pills (5.2) |
| `warning-tint` / `warning-tint-foreground` | `#fef3c7` / `#b45309` | Soft amber/orange surfaces — Scheduled/Pending pills (5.2) |
| `destructive-tint` | `#fee2e2` | Soft red surfaces — Cancel Application button, Failed pills (5.2) |
| `neutral-tint` / `neutral-tint-foreground` | `#e2e8f0` / `#475569` | Soft gray surfaces — Locked pills/badges (5.2) |
| `muted-solid` | `#94a3b8` | Solid gray-blue fill — disabled "Issue License (pass all tests first)" CTA (5.2) |
| `border` / `input` | `#e2e8f0` | Card/table borders, input borders |
| `ring` | `#2563eb` | Focus outlines |
| `sidebar` / `sidebar-foreground` | `#0f172a` / `#cbd5e1` | Sidebar background/default text |
| `sidebar-primary` | `#2563eb` | Active sidebar item background |
| `sidebar-accent` | `#1e293b` | Sidebar hover state |
| `chart-1..5` | blue/green/amber/red/slate | Any future dashboard charts — cycle through in this order |

## Radius Scale

`--radius: 0.5rem` is the base. Derived scale (already wired in `@theme
inline`, just use the Tailwind class):

| Class | Value |
|---|---|
| `rounded-sm` | `0.3rem` |
| `rounded-md` | `0.4rem` |
| `rounded-lg` | `0.5rem` (base — default for `Card`, `Input`, `Button`) |
| `rounded-xl` | `0.7rem` |
| `rounded-2xl` | `0.9rem` |
| `rounded-3xl` | `1.1rem` |
| `rounded-4xl` | `1.3rem` |
| `rounded-full` | pills, avatars, `StatusPill` |

## Typography

See `ui-rules.md § Typography Scale` for the full class-by-use table.
Font families: `font-sans` (Inter, default body/UI), `font-mono`
(JetBrains Mono — used specifically for IDs like `N-20348871`, `L-3`,
`LIC-3`, `INT-1`, matching the reference screenshots' monospace styling on
those values).

## Reuse Note — Auth Screen

The `/` (login) page's dark left brand panel (`AuthSplitScreen` in
`ui-registry.md`) uses the **same `--sidebar`/`--sidebar-foreground` tokens**
as the app shell's sidebar — it is not a new dark surface with its own
palette. If the sidebar's navy ever changes, the login panel changes with it
automatically; don't hardcode a second navy value for this screen.

## Known Gap — flag, don't silently fix

`:root` is fully defined; **no `.dark { ... }` block exists** even though
`@custom-variant dark` is declared. Do not ship a dark-mode toggle until this
is resolved — see `ui-rules.md § Dark Mode — Known Gap`.
