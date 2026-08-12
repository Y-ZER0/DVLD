import type { LucideIcon } from "lucide-react"
import {
  Car,
  Gavel,
  IdCard,
  LayoutGrid,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react"

// Static navigation configuration for the app shell sidebar —
// mirrors project-overview.md § Pages & Navigation exactly (the four
// groups and every route), icons from ui-registry.md § Icon Set.
// Routes for not-yet-built features 404 until their phase lands; the
// nav itself is fixed product chrome, not feature code.

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    label: "Registry",
    items: [
      { label: "People Management", href: "/people", icon: Users },
      { label: "User Management", href: "/users", icon: UserCog },
    ],
  },
  {
    label: "Applications Hub",
    items: [
      { label: "Local Driving Licenses", href: "/applications/local", icon: IdCard },
      { label: "International Licenses", href: "/applications/international", icon: ShieldCheck },
      { label: "Renewals & Replacements", href: "/applications/renewals", icon: RefreshCw },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Drivers & History", href: "/drivers", icon: Car },
      { label: "Detain & Release", href: "/detain-release", icon: Gavel },
      { label: "System Configuration", href: "/settings/configuration", icon: Settings2 },
    ],
  },
]