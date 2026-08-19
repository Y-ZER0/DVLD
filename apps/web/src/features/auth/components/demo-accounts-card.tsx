import { Card, CardContent } from "@/components/ui/card"

const DEMO_ACCOUNTS = [
  { username: "admin", label: "Administrator", password: "Admin@123" },
  { username: "r.sabbagh", label: "Licensing Officer", password: "Sabbagh@123" },
]

export function DemoAccountsCard() {
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <CardContent className="p-0">
        <p className="px-4 pb-2 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Demo accounts
        </p>
        <div className="divide-y divide-border">
          {DEMO_ACCOUNTS.map((account) => (
            <div
              key={account.username}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{account.username}</span>
                <span className="text-xs text-muted-foreground">
                  {account.label}
                </span>
              </div>
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