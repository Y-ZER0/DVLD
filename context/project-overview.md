# project-overview.md

## About the Project & Problem Solved

DVLD (Driver & Vehicle Licensing Department) is an **internal back-office system**
used by department clerks and administrators to replace paper-based citizen and
license record-keeping. It is not a citizen-facing portal — every screen in this
product is used by an authenticated staff member (the UI consistently shows a
single logged-in `admin` identity in the top-right corner).

The problems it solves:

- Citizen records (`People`) and system login accounts (`Users`) are currently
  tracked separately/on paper, causing duplicate or mismatched identities.
- Driving tests are supposed to happen in a fixed order (Vision → Written →
  Street) but nothing currently *enforces* that order or prevents re-editing a
  result after the fact.
- License issuance, renewal, replacement, detention, and release are separate
  paper workflows with no single audit trail per driver.
- Fees for applications, tests, and license classes are currently fixed in
  policy documents rather than configurable, and there's no record of what fee
  was actually charged at the time of a given transaction.

## Pages & Navigation

The application uses a persistent left sidebar (dark, `--sidebar` token) grouped
into four sections, plus a top bar (quick search, notifications, account menu).

| Nav Group | Page | Route |
|---|---|---|
| Overview | Dashboard | `/dashboard` |
| Registry | People Management | `/people` |
| Registry | User Management | `/users` |
| Applications Hub | Local Driving Licenses | `/applications/local` |
| Applications Hub | Local Driving Licenses (detail) | `/applications/local/[id]` |
| Applications Hub | International Licenses | `/applications/international` |
| Applications Hub | Renewals & Replacements | `/applications/renewals` |
| Operations | Drivers & History | `/drivers` |
| Operations | Drivers & History (detail) | `/drivers/[id]` |
| Operations | Detain & Release | `/detain-release` |
| Operations | System Configuration | `/settings/configuration` |
| — | Login | `/` |

## Core User Flow

0. A department employee signs in at `/` with a Username/Password tied
   to their own linked `People` record. **There is no admin tier** — every
   signed-in user has identical access to every screen in the app (see
   `architecture.md` invariant #31). The sign-in screen's "Demo accounts"
   helper lists seed usernames with an informal job-title label (e.g.
   "Administrator", "Licensing Officer") purely as human-readable context for
   whoever is testing the app — that label is not stored, checked, or
   enforced anywhere.
1. A clerk creates a **Person** record (People Management) with a validated
   National Number.
2. Optionally, the clerk links that person to a **User** login account (User
   Management) so that person can themselves act as staff.
3. A citizen applies for a **Local Driving License**: clerk selects the citizen
   and a License Class (each class has a minimum age, enforced at selection
   time). Application fee is charged and snapshotted.
4. The applicant proceeds through the **Test Pipeline**, strictly in order:
   Vision → Written → Street. Each stage requires scheduling an appointment,
   then recording a Passed/Failed result. Recording a result **permanently
   locks** that appointment. A failed attempt requires booking a brand-new
   appointment for the same stage — the old one stays locked and visible in
   Appointment History.
5. Once all three tests show Passed, the clerk can **Issue License**. If the
   person has no existing `Drivers` record, one is created automatically in
   the same transaction. License fee is snapshotted; expiration date is
   computed from `IssueDate + LicenseClasses.DefaultValidityLength` years.
6. A driver who already holds an active **Class 3 (Car)** license can apply for
   an **International License** — the system verifies the active local license
   server-side before allowing issuance. International licenses have a fixed
   1-year validity.
7. **Renewals & Replacements** is a single register of every local license —
   a clerk acts directly on a row (Renew / Damaged / Lost); issuing the
   replacement always deactivates the prior row of the same class. A license
   with an open (unreleased) detention shows these actions disabled — it
   must be released first (invariant #32).
8. If a driver commits a violation, their license can be **Detained** (a fine
   is recorded). The Detain & Release screen shows a running "Total Due" per
   detention (`fine + $20 release application fee`, computed for display). A
   detained license returns to good standing only once a clerk clicks
   **Release**, which files a Release Application and processes it — never by
   directly flipping a status flag.
9. **Drivers & History** gives any clerk a full audit trail per driver: a
   summary card (contact info, Driver ID, Driver Since) plus tabs for Local
   Licenses, International Licenses, and the full Test Log.
10. **System Configuration** lets any clerk edit `ApplicationTypes` fees,
    `TestTypes` fees, and `LicenseClasses`' minimum age / validity years /
    fee — changes apply immediately (autosave per field) without touching
    code, and without an admin tier gating who can make them.
11. The **Dashboard** aggregates live counts (active applications, tests today,
    active drivers, detained licenses) and recent activity across all of the
    above.

## Data Architecture

Full schema lives in `architecture.md § Data Flow & Database Schema`. At a
glance, the core entity groups are:

- **Identity:** `People`, `Users`
- **Configuration (lookup):** `LicenseClasses`, `ApplicationTypes`, `TestTypes`
- **Applications:** `Applications` (generic) → `LocalDrivingLicenseApplications`
  (specialization)
- **Testing:** `TestAppointments`, `Tests`
- **Licensing:** `Drivers`, `Licenses`, `InternationalLicenses`
- **Enforcement:** `DetainedLicenses`

## Scope

**In scope**
- People CRUD + National Number validation
- User account CRUD, linked to People, with hashed passwords and active/inactive status
- Configurable lookup data (license classes, application types, test types)
- Local driving license application filing and tracking
- Sequential test scheduling and result recording, with locking
- First-time license issuance (auto-creates Driver record)
- License renewal and replacement (lost/damaged)
- International license issuance gated on an active local Class 3 license
- Detain & release workflow
- Full driver/license audit history
- Admin-editable fee configuration
- Operational dashboard

**Out of scope (for this build)**
- Real payment gateway integration — fees are tracked and charged as data
  (`PaidFees`) but no card/payment processor is wired in
- SMS/email notification delivery
- Multi-language / i18n
- Native mobile apps
- Vehicle registration (this system is driver licensing only, despite the
  department's full name)
- Biometric verification or photo-capture hardware — `PhotoUrl` is stored as a
  reference string only
- Public/citizen self-service portal — this is staff-only

## Target User & Success Criteria

**Target user:** DVLD department employees/operators — internal staff, not the
general public. There is no internal hierarchy in the software itself (see
`architecture.md` invariant #31); any real-world job-title distinction
(clerk vs. licensing officer, etc.) is organizational, not something the
system enforces. Users are moderately technical (comfortable with forms and
tables, not necessarily comfortable with ambiguity or undo-able mistakes),
which is why every irreversible action (locking a test result, issuing a
license, detaining a license) needs an explicit confirmation modal with a
clear description of the consequence.

**Success criteria**
- It is structurally impossible to record a Street Test result before a
  Written Test has been passed.
- It is structurally impossible to issue a license without all required tests
  passed.
- Every `PaidFees` value on a historical record reflects what was actually
  charged at the time, even if the configured fee is later changed.
- Every driver has one queryable page showing their complete license and
  enforcement history.
- Dashboard figures match the underlying tables exactly (no cached/stale
  counts) on every page load.
