"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { testingService } from "../services/testing.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { RecordTestResultRequestDto } from "../record-test-result-request.dto"

// useRecordTestResult — records the Pass/Fail verdict for one appointment
// and permanently locks it (PATCH /test-appointments/:id/result, 5.1 —
// invariants #20/#21). The hook is bound to the owning APPLICATION id (the
// invalidation target); the appointment being recorded rides in with the
// payload because the action lives on the stage's open booking. On success
// the pipeline changed shape server-side (a Passed stage advances the
// current-stage pointer; a Failed one stays on 'Schedule' with the
// appointment locked in history), so the detail AND pipeline queries for
// the application both invalidate (invariant #6). Server rejections (409
// already-locked / non-New application) keep the record-result modal open
// with the message verbatim.

export function useRecordTestResult(localDrivingLicenseApplicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service — hooks never
    //         touch apiClient directly (invariant #4). The appointment id
    //         is part of the payload shape, not bound at hook time: the
    //         application screen can record results against whichever
    //         appointment is currently open.
    mutationFn: ({
      appointmentId,
      dto,
    }: {
      appointmentId: number
      dto: RecordTestResultRequestDto
    }) => testingService.recordTestResult(appointmentId, dto),

    onSuccess: () => {
      // STEP 2: The appointment is now locked and possibly the stage
      //         passed — both visible states come from the server, so
      //         invalidate rather than hand-patch.
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.detail(localDrivingLicenseApplicationId),
      })
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.pipeline(localDrivingLicenseApplicationId),
      })
    },
  })
}