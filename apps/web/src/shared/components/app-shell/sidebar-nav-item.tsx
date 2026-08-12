"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { NavItem } from "./nav-config"

// SidebarNavItem (ui-registry.md) — one navigation link in the app shell
// sidebar. Expanded mode: icon + label on a ghost Button, with the active
// route filled as a bg-primary pill and inactive rows in
// text-sidebar-foreground hovering to bg-sidebar-accent. Collapsed mode
// (desktop icon rail): icon-only row with a Tooltip so the label is never
// lost (a11y — an unlabeled icon is ambiguous).

interface SidebarNavItemProps {
  item: NavItem
  active: boolean
  /** True when the desktop sidebar is the narrow icon rail. */
  collapsed: boolean
  /** Called after navigation (used by the mobile drawer to close itself). */
  onNavigate?: () => void
}

export function SidebarNavItem({ item, active, collapsed, onNavigate }: SidebarNavItemProps) {
  // STEP 1: Build the link row — h-10 keeps the 40px hit target
  //         (ui-rules.md § Accessibility); the active pill re-declares the
  //         hover colors so the pill never turns gray on hover.
  const row = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}>
        <item.icon className="size-4 shrink-0" aria-hidden="true" />
        {/* STEP 2: The visible label is dropped in collapsed (icon rail)
            mode — an sr-only twin keeps the link accessible to screen
            readers in both modes (ui-rules.md accessibility mandates). */}
        {collapsed ? (
          <span className="sr-only">{item.label}</span>
        ) : (
          <span className="truncate text-sm font-medium">{item.label}</span>
        )}
      </Link>
    </Button>
  )

  // STEP 3: Only collapsed rows need the Tooltip — expanded rows carry
  //         their label on screen already.
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{row}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return row
}