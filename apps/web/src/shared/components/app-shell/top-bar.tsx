"use client"

import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/shared/stores/auth.store"
import { useUiStore } from "@/shared/stores/ui.store"

interface TopBarProps {
  onOpenMobileNav: () => void
}

function getInitials(fullName: string | undefined, username: string | undefined): string {
  const source = fullName?.trim() || username?.trim() || ""
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
  return initials || "…"
}

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="size-10 md:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden size-10 md:inline-flex"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="size-4" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="size-4" aria-hidden="true" />
        )}
      </Button>

      <div className="relative min-w-0 max-w-md flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          className="h-10 pl-9"
          placeholder="Quick search: national ID, license, driver..."
          aria-label="Quick search"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="icon" className="size-10" aria-label="Notifications">
          <Bell className="size-4" aria-hidden="true" />
        </Button>
        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <Avatar className="size-9" aria-hidden="true">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user?.fullName, user?.username)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {user?.username ?? "…"}
          </span>
        </div>
      </div>
    </header>
  )
}