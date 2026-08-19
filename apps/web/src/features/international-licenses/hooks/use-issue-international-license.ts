"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { internationalLicensesService } from "../services/international-licenses.service"
import { internationalLicensesKeys } from "../internationalLicensesKeys"
import type { IssueInternationalLicenseRequestDto } from "../dtos/issue-international-license-request.dto"

export function useIssueInternationalLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: IssueInternationalLicenseRequestDto) =>
      internationalLicensesService.issueInternationalLicense(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internationalLicensesKeys.lists() })
    },
  })
}