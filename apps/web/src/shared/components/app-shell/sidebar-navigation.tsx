"use client"

import { usePathname } from "next/navigation"
import { IdCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { navGroups } from "./nav-config"
import { SidebarNavItem } from "./sidebar-nav-item"

interface SidebarNavigationProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNavigation({ collapsed = false, onNavigate }: SidebarNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href.endsWith("/") ? href : `${href}/`)

  return (
    <div className="flex h-full flex-col">
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