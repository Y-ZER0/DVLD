"use client"

import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

// useUnlinkedPeople — the "Link to Person" combobox feed (GET
// /people/unlinked). 5-minute staleTime: the unlinked set only changes
// when a user account is created, and useCreateUser invalidates this
// exact key on success — so a freshly linked person disappears from the
// picker immediately.

export function useUnlinkedPeople() {
  return useQuery({
    queryKey: usersKeys.unlinkedPeople(),
    queryFn: () => userService.getUnlinkedPeople(),
    // STEP 1: The combobox filters client-side over the full array (the
    //         backend returns no pagination by design — a page window
    //         would hide options, build-plan.md § 2.1), so there's no
    //         per-keystroke fetching to worry about.
    staleTime: 5 * 60_000,
  })
}