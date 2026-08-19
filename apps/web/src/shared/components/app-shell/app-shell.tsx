"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useUiStore } from "@/shared/stores/ui.store"
import { SidebarNavigation } from "./sidebar-navigation"
import { TopBar } from "./top-bar"

export function AppShell({ children }: { children: ReactNode }) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out md:flex",
          sidebarCollapsed ? "w-16" : "w-72",
        )}
      >
        <SidebarNavigation collapsed={sidebarCollapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 border-r-sidebar-border bg-sidebar text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation for the DVLD back office
          </SheetDescription>
          <SidebarNavigation onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}