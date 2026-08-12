import { CircleCheck, IdCard } from "lucide-react"
import { SignInForm } from "./sign-in-form"
import { DemoAccountsCard } from "./demo-accounts-card"

// The three feature bullets on the dark brand panel — hardcoded marketing
// copy from the descriptive prompt / build-plan 0.B.2, not data.
const FEATURE_BULLETS = [
  "Sequential test enforcement",
  "Real-time license lifecycle",
  "Detain and release control",
]

// AuthSplitScreen — the / login page layout (ui-registry.md § AuthSplitScreen,
// build-plan 0.B.2): a 50/50 split at lg+, dark informational brand panel
// on the left (bg-sidebar tokens, hidden below lg) and a white functional
// panel with the sign-in form on the right.

export function AuthSplitScreen() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT — dark brand panel, dropped entirely below lg (ui-rules.md:
          decorative, not informational, so it never scrolls on mobile). */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-sidebar-accent via-sidebar to-sidebar lg:flex lg:flex-col">
        {/* STEP 1: Subtle blue glow in the top-right corner — a blurred
            primary-colored blob behind the content, clipped by overflow-
            hidden. Uses the --sidebar gradient family, no raw hex. */}
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/25 blur-3xl"
        />

        {/* STEP 2: Top-left header — blue square logo tile with a user-card
            symbol (IdCard) + white wordmark. */}
        <header className="relative z-10 flex items-center gap-3 p-10">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IdCard className="size-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-sidebar-primary-foreground">
            DVLD Licensing Department
          </span>
        </header>

        {/* STEP 3: Centered informational copy — headline, one-line
            description, then the three bullets with circular green check
            icons (per the descriptive prompt). */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-16">
          <h1 className="max-w-md text-4xl font-bold text-sidebar-primary-foreground">
            Driver &amp; Vehicle Licensing Portal
          </h1>
          <p className="mt-4 max-w-md text-sidebar-foreground">
            Manage applications, testing workflows, license issuance and
            enforcement from one secure operational console.
          </p>
          <ul className="mt-8 space-y-4 text-sidebar-foreground">
            {FEATURE_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/90">
                  <CircleCheck
                    className="size-4 text-success-foreground"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-sm font-medium">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RIGHT — white functional panel, form vertically centered. */}
      <section className="flex items-center justify-center bg-card px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <SignInForm />
          <DemoAccountsCard />
        </div>
      </section>
    </main>
  )
}