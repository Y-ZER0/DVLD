"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search, Settings2, UserCog } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = () => {
    clearAuth()
    queryClient.clear()
    router.replace("/")
  }

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 border-l border-border pl-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="User menu"
            >
              <Avatar className="size-9" aria-hidden="true">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.fullName, user?.username)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-medium">{user?.fullName ?? user?.username ?? "…"}</span>
                {user?.fullName && user?.username ? (
                  <span className="text-xs text-muted-foreground">{user.username}</span>
                ) : null}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="flex flex-col">
                <span className="text-sm font-medium leading-none">{user?.fullName ?? user?.username ?? "…"}</span>
                {user?.fullName && user?.username ? (
                  <span className="text-xs font-normal text-muted-foreground">{user.username}</span>
                ) : null}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/users">
                <UserCog aria-hidden="true" />
                Manage users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/configuration">
                <Settings2 aria-hidden="true" />
                System Configuration
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}