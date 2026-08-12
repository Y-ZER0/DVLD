"use client"

import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/shared/stores/auth.store"
import { useUiStore } from "@/shared/stores/ui.store"

// TopBar (ui-registry.md) — the app shell's white top bar: mobile drawer
// trigger, desktop sidebar collapse toggle, the quick-search input
// (decorative placeholder per build-plan 0.C.1 — no feature wires it yet),
// the notification bell, and the signed-in account badge (Avatar initials +
// username) read from useAuthStore.

interface TopBarProps {
  /** Opens the mobile off-canvas drawer (only rendered/needed below md). */
  onOpenMobileNav: () => void
}

// Derives the avatar initials from the session user's full name — first
// letters of the first two words ("System Administrator" → "SA"), falling
// back to the username if the name is missing.
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
  // STEP 1: Selector reads only (invariant #3) — chrome state from
  //         ui.store, session identity from auth.store.
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
      {/* Mobile drawer trigger — only relevant below md where the sidebar
          is hidden (ui-rules.md responsive breakpoints). */}
      <Button
        variant="ghost"
        size="icon"
        className="size-10 md:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      {/* Desktop collapse toggle — flips the Zustand chrome flag that the
          sidebar animates against. */}
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

      {/* Quick search — non-functional placeholder (build-plan 0.C.1);
          a later feature wires the actual search. */}
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

      {/* Right cluster: bell then account badge. */}
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