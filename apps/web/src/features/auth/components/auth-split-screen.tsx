import { CircleCheck, IdCard } from "lucide-react"
import { SignInForm } from "./sign-in-form"
import { DemoAccountsCard } from "./demo-accounts-card"

const FEATURE_BULLETS = [
  "Sequential test enforcement",
  "Real-time license lifecycle",
  "Detain and release control",
]

export function AuthSplitScreen() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-sidebar-accent via-sidebar to-sidebar lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/25 blur-3xl"
        />

        <header className="relative z-10 flex items-center gap-3 p-10">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IdCard className="size-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-sidebar-primary-foreground">
            DVLD Licensing Department
          </span>
        </header>

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

      <section className="flex items-center justify-center bg-card px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <SignInForm />
          <DemoAccountsCard />
        </div>
      </section>
    </main>
  )
}