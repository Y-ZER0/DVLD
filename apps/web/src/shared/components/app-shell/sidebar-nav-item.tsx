"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { NavItem } from "./nav-config"

interface SidebarNavItemProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

export function SidebarNavItem({ item, active, collapsed, onNavigate }: SidebarNavItemProps) {
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
        {collapsed ? (
          <span className="sr-only">{item.label}</span>
        ) : (
          <span className="truncate text-sm font-medium">{item.label}</span>
        )}
      </Link>
    </Button>
  )

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