import { Card, CardContent } from "@/components/ui/card"

// DemoAccountsCard — dev/staging-only helper listing the seeded demo
// credentials (build-plan 0.B.2, ui-registry.md § DemoAccountsCard). The
// username + informal job-title label are hardcoded copy in this component
// ONLY — never read from or written to any database column, and never used
// to make an authorization decision (architecture.md invariant #31). The
// plaintext passwords are deliberate — they exist solely so a tester can
// log in during development — and must never ship to production (this
// component renders nothing when NODE_ENV === 'production').

const DEMO_ACCOUNTS = [
  { username: "admin", label: "Administrator", password: "Admin@123" },
  { username: "r.sabbagh", label: "Licensing Officer", password: "Sabbagh@123" },
]

export function DemoAccountsCard() {
  // STEP 1: The production gate happens at render time AND the value is
  //         inlined by Next at build time — a production bundle contains
  //         neither the plaintext passwords nor this card.
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <CardContent className="p-0">
        {/* STEP 2: Section label + one row per seed account, separated by
            faint dividers (the user-specified "Demo accounts" block). */}
        <p className="px-4 pb-2 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Demo accounts
        </p>
        <div className="divide-y divide-border">
          {DEMO_ACCOUNTS.map((account) => (
            <div
              key={account.username}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              {/* STEP 3: username (bold) + informal label (muted) on the
                  left — the label is decorative flavor, not a role. */}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{account.username}</span>
                <span className="text-xs text-muted-foreground">
                  {account.label}
                </span>
              </div>
              {/* STEP 4: password in mono, muted, on the right — mirrors
                  the reference screenshot's typography (ui-tokens.md). */}
              <code className="font-mono text-xs text-muted-foreground">
                {account.password}
              </code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}