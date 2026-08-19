"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { IssueLicenseRequestDto } from "../dtos/issue-license-request.dto"

// useIssueLicense — the 6.2 issuance mutation (POST
// /local-license-applications/:id/issue-license, 6.1 service). Bound to
// the owning application id (the invalidation target); the DTO is just
// the optional notes. On success the application's status flipped to
// Completed server-side, so the detail AND every list view must refetch
// (invariant #6) — the returned LicenseDto needs no cache patch because
// the page holds it in state for the post-issuance banner. The
// build-plan § 6.2 drivers-list invalidation is deferred until Feature
// 10 ships (no driversKeys exist yet — Session 16 memory note). Server
// rejections (409 pipeline gate / dead application / active same-class
// license, invariants #22/#26) surface verbatim in the modal, which
// stays open.

export function useIssueLicense(localDrivingLicenseApplicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service layer — hooks
    //         never touch apiClient directly (invariant #4).
    mutationFn: (dto: IssueLicenseRequestDto) =>
      localLicenseApplicationsService.issueLicense(localDrivingLicenseApplicationId, dto),

    onSuccess: () => {
      // STEP 2: The application is now Completed — the detail Status
      //         pill, the disappearing Cancel button, and the register
      //         row's pill all re-read server state (invariant #6). The
      //         pipeline query is untouched by issuance (stages stay
      //         Passed), so it is deliberately NOT invalidated.
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.detail(localDrivingLicenseApplicationId),
      })
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.lists() })
    },
  })
}