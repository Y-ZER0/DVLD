"use client"

import { usePathname } from "next/navigation"
import { IdCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { navGroups } from "./nav-config"
import { SidebarNavItem } from "./sidebar-nav-item"

// SidebarNavigation — the full sidebar body: brand header (logo tile +
// wordmark, mirroring AuthSplitScreen's header per ui-tokens.md Reuse
// Note) and the four nav groups from project-overview.md § Pages &
// Navigation. Shared by the persistent desktop aside and the mobile
// off-canvas Sheet so the two can never drift apart.

interface SidebarNavigationProps {
  /** Icon-rail mode (desktop collapsed); draws labels in Tooltips instead. */
  collapsed?: boolean
  /** Fired after a link click (mobile drawer closes itself via this). */
  onNavigate?: () => void
}

export function SidebarNavigation({ collapsed = false, onNavigate }: SidebarNavigationProps) {
  // STEP 1: Read the current route once, here, and pass the resolved
  //         active flag down — keeps matching logic in one place instead
  //         of one usePathname call per item.
  const pathname = usePathname()

  // STEP 2: Exact match activates the item; a deeper path activates its
  //         section parent (e.g. /applications/local/[id] keeps "Local
  //         Driving Licenses" lit once detail pages exist).
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href.endsWith("/") ? href : `${href}/`)

  return (
    <div className="flex h-full flex-col">
      {/* Brand header — same tile/wordmark pattern as the login screen's
          left panel (ui-tokens.md § Reuse Note: one navy, one logo). */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <IdCard className="size-5" aria-hidden="true" />
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-wide text-sidebar-primary-foreground">
            DVLD Licensing Department
          </span>
        )}
      </div>

      {/* Nav groups — space-y separation so the four sections read as
          distinct blocks; labels hide entirely in icon-rail mode. */}
      <nav aria-label="Main navigation" className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 pb-1.5 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}