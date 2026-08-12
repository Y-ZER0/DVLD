"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useUiStore } from "@/shared/stores/ui.store"
import { SidebarNavigation } from "./sidebar-navigation"
import { TopBar } from "./top-bar"

// AppShell (ui-registry.md § AppShell, build-plan 0.C.1) — the persistent
// frame every protected page renders inside. Desktop (md+): fixed dark
// sidebar (full 264px bar, or the icon rail when collapsed via
// ui.store), white TopBar, light content slot capped at max-w-screen-2xl.
// Mobile (<md): the sidebar becomes an off-canvas Sheet drawer per
// ui-rules.md § Layout Grid Rules — never pushing content.

export function AppShell({ children }: { children: ReactNode }) {
  // STEP 1: Chrome state — the desktop collapsed flag is Zustand
  //         (library-docs.md § 5, no persist); the mobile drawer's open
  //         flag is transient and only read by the two components that
  //         share it (trigger + drawer), so local state suffices.
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar — sticky so it stays pinned while content
          scrolls; width animates between full bar and icon rail. */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out md:flex",
          sidebarCollapsed ? "w-16" : "w-[264px]",
        )}
      >
        <SidebarNavigation collapsed={sidebarCollapsed} />
      </aside>

      {/* Content column — min-w-0 lets the flex child shrink instead of
          pushing the page into horizontal scroll (ui-rules.md). */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>

      {/* Mobile off-canvas drawer — Sheet provides focus trap, Escape and
          backdrop-close for free (ui-rules.md accessibility mandates).
          Nav item clicks close it via onNavigate. sr-only title/description
          keep the dialog's a11y contract (Radix requires a title). */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[264px] border-r-sidebar-border bg-sidebar text-sidebar-foreground"
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