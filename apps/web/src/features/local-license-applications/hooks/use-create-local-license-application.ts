"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { CreateLocalLicenseApplicationRequestDto } from "../create-local-license-application-request.dto"

// useCreateLocalLicenseApplication — files a new local driving license
// application, then refreshes every application list. The new row could
// match ANY active list filter (or none page-wise), so the whole lists()
// branch invalidates (invariant #6, useCreatePerson/useCreateUser
// precedent). Server rejections (400 underage / 404 unknown citizen or
// class / malformed 400) surface verbatim in the modal and keep it open.

export function useCreateLocalLicenseApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service — hooks never
    //         touch apiClient directly (invariant #4).
    mutationFn: (dto: CreateLocalLicenseApplicationRequestDto) =>
      localLicenseApplicationsService.createLocalLicenseApplication(dto),

    onSuccess: () => {
      // STEP 2: Invalidate rather than patch — the new row's server truth
      //         (fee snapshot, status New) must come from the API.
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.lists() })
    },
  })
}