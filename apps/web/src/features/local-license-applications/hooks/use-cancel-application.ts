"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

// useCancelApplication — the one-way door transition (New → Cancelled,
// PATCH /local-license-applications/:id/cancel). On success the row's
// status changed, so every list view AND the detail query must refetch —
// the rival mutations cannot know which list the row appeared in. The
// backend 409s on a non-New application; that message surfaces verbatim in
// the confirmation dialog, which stays open (same 409 stay-open pattern as
// DeleteUserDialog).

export function useCancelApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service (invariant #4).
    mutationFn: (id: number) => localLicenseApplicationsService.cancelApplication(id),

    // STEP 2: Invalidate broad, patch nothing — the Cancelled pill and the
    //         disappearing Cancel button both re-read server state
    //         (invariant #6).
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.detail(id) })
    },
  })
}