import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: number
  description: string
  href: string
  icon: LucideIcon
}

export function StatCard({ label, value, description, href, icon: Icon }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{description}</p>
        <Link
          href={href}
          className="text-xs font-medium text-foreground hover:text-primary"
        >
          View →
        </Link>
      </div>
    </div>
  )
}
