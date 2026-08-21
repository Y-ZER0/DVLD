"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { lookupKeys } from "@/features/lookup/lookupKeys"
import { configurationService } from "../services/configuration.service"
import type { UpdateApplicationTypeRequestDto } from "../dtos/update-application-type-request.dto"

export function useUpdateApplicationType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateApplicationTypeRequestDto }) =>
      configurationService.updateApplicationType(id, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.applicationTypes() })
    },
  })
}
