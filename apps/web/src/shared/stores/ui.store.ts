"use client"

import { create } from "zustand"

// The UI-chrome store (library-docs.md § 5): currently only the app shell's
// desktop sidebar collapsed state lives here. This is CLIENT state — no
// API data ever belongs in a Zustand store (invariant #1), and deliberately
// NOT persisted: the sidebar resets to expanded on every load, matching
// library-docs.md § 5 ("no persistence needed for ui.store.ts").

interface UiState {
  // Desktop (md+) sidebar: true = icon-only rail, false = full 260px bar.
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,

  // A single toggle action is all the shell needs — the SidebarNavItem
  // labels and the topbar trigger both react to the one boolean.
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))