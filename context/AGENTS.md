# AGENTS.md — Master Instruction File
## Project: DVLD — Driver & Vehicle Licensing Department System

This file is the entry point. Read it first, every session, before touching any other
context file or writing a single line of code.

---

## 1. Purpose

You (the agent) are building DVLD, an internal back-office system for a government
licensing department, using:

- **Backend:** NestJS + TypeORM
- **Database:** PostgreSQL, hosted on Supabase
- **Frontend:** Next.js (App Router)
- **Server state:** TanStack Query
- **Client state:** Zustand
- **Styling:** Tailwind CSS + shadcn/ui

The other 9 files in this knowledge base are not optional reading — they are the
contract you are building against. This file tells you the order to read them in,
the rules that never change, and exactly when to invoke each skill.

---

## 2. Read Order (every session, before writing code)

1. `project-overview.md` — what the product is, who uses it, what's in/out of scope
2. `architecture.md` — tech stack, folder structure, schema, **invariants (never violate)**
3. `code-standards.md` — naming, structure, and the mandatory documentation protocol
4. `ui-tokens.md` — the exact design tokens (colors, radius, type) — never invent your own
5. `ui-rules.md` — layout, responsiveness, accessibility, status-color mapping
6. `ui-registry.md` — components that already exist or are specified — reuse, don't reinvent
7. `library-docs.md` — exact integration patterns for TypeORM, class-validator, TanStack Query, Zustand, shadcn
8. `build-plan.md` — the ordered feature list, split into LOGIC and UI sub-tasks
9. `progress-tracker.md` — what is already done; update this at the end of every session

If any instruction in a user message conflicts with an invariant in `architecture.md`,
the invariant wins. Flag the conflict to the user instead of silently violating it.

---

## 3. Core Rules That Never Change

These are not style preferences. They are load-bearing. The full, numbered list lives
in `architecture.md § Invariants` — read it in full before your first feature. The two
most commonly broken ones are repeated here because they change *how* you work, not
just *what* you write:

### 3.1 UI and Logic are never built in the same pass

Every feature in `build-plan.md` is pre-split into a `[LOGIC]` sub-task and a `[UI]`
sub-task. This is deliberate and mandatory:

- Finish `[LOGIC]` completely (entity, migration, DTOs, repository, service,
  controller, module wiring) for a feature before writing **any** frontend code
  for that same feature.
- Do not open a `.tsx` file and a NestJS module for the same feature in the same
  work session. If you catch yourself doing this, stop and re-read `build-plan.md`.
- The only exception is `packages/shared` DTO interfaces, which are contract
  definitions, not implementation, and both sides depend on them.
- After `[LOGIC]` is done, run the **REVIEW** skill against it before starting `[UI]`.

Why: this system has strict sequencing rules (test order, license issuance gates,
detain/release flows). Mixing UI and logic construction is how those rules get
silently bypassed by a UI that "just calls the endpoint" before the endpoint's
guard clauses actually exist.

### 3.2 Mandatory Inline Documentation Protocol

**Every time you write or start implementing a feature — i.e. every time you are
about to write a method, handler, hook, or component that belongs to a feature —
you must first write a step-by-step, plain-language comment explaining the logic,
before writing the code that implements each step.**

Concretely:

- Above every method/function tied to a feature, write a short header comment
  stating what the method does and why it exists.
- Inside the method, before each logical step (not necessarily every single
  line, but every distinct piece of reasoning), write a numbered `// STEP n:`
  comment, then the code that performs that step directly beneath it.
- The comment must explain *why*, not just restate the code. `// STEP 1: get the user`
  above `const user = await find(id)` is not acceptable. `// STEP 1: load the user
  first so we can 404 before touching anything else` is.
- This applies to backend services/controllers/repositories and frontend
  hooks/components alike.
- The full specification and worked examples (NestJS + React) are in
  `code-standards.md § Mandatory Inline Documentation Protocol`. Follow that
  format exactly — do not improvise a different comment style.

This is not documentation-as-afterthought. Write the step comments *before* you
write the code they describe, in the same order you'll write the code, the same
way you'd write pseudocode. If you can't articulate the steps in plain language
first, you don't understand the feature well enough to implement it — go back to
`build-plan.md`'s plain-English walkthrough for that feature, or invoke ARCHITECT.

---

## 4. Skill Invocation

### ARCHITECT
**Trigger:** Before starting any `[LOGIC]` sub-task, and before any `[UI]` sub-task
that involves more than a single simple component.
**Action:** Re-read the feature's plain-English walkthrough in `build-plan.md`,
re-read the relevant invariants, ask clarifying questions if the plan is
ambiguous, then write a short step-by-step implementation plan before touching
a file.

### IMPRINT
**Trigger:** Immediately after building any UI component or view.
**Action:** Check the new UI against `ui-tokens.md` and `ui-rules.md`. Confirm
no raw hex codes were used, spacing/typography match the scale, responsive
breakpoints behave per `ui-rules.md`, and the component is registered (or
reused) per `ui-registry.md`. Report a precise fix list, don't just say "looks
fine."

### REVIEW
**Trigger:** After a `[LOGIC]` sub-task is functionally complete, and again
after its paired `[UI]` sub-task is complete.
**Action:** Cross-reference the implementation against the ARCHITECT plan, the
relevant invariants, and `code-standards.md`. Explicitly check: did every
mutating endpoint persist `CreatedByUserID`/`ReleasedByUserID` from the session
and not the request body? Did every method get its step-comment documentation?
Is UI/logic separation intact?

### RECOVER
**Trigger:** On any runtime error, build failure, or terminal exception.
**Action:** Diagnose the exact failure point, isolate the broken module, and
write a targeted patch. Do not rewrite unrelated working code while fixing an
unrelated bug.

### REMEMBER
**Trigger:** At the end of every session, or when a phase/feature is completed.
**Action:** Update `progress-tracker.md` — check off completed items, add a
dated session-log entry summarizing what was built, any architectural
decisions made mid-session, and what the next session should start with.

---

## 5. Non-Negotiables Summary (see architecture.md for the full numbered list)

- Server state → TanStack Query. Client/UI state → Zustand. Never mixed.
- Entities never leave the backend — every service returns a DTO via a
  `toDto()` gate.
- Fees (`ApplicationFees`, `TestTypeFees`, `ClassFees`) are read from the
  lookup tables at transaction time and snapshotted onto the row (`PaidFees`)
  — never hardcoded in the frontend, never recomputed from "current" config
  after the fact.
- Test order is Vision → Written → Street, strictly. A locked appointment is
  immutable. A failed test requires a brand-new appointment row, not an edit.
- A License issuance auto-creates a `Drivers` row if one doesn't exist for
  that person, inside the same transaction.
- International License issuance is blocked server-side (not just UI-side)
  unless the driver holds an active Class-3 local license.
- A driver may never hold two `IsActive = true` licenses of the same
  `LicenseClassID` at once — renewals/replacements must deactivate the old
  row first.
