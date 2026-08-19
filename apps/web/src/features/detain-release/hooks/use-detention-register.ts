"use client"

import { useQuery } from "@tanstack/react-query"
import {
  detainReleaseService,
  type DetentionRegisterParams,
} from "../services/detain-release.service"
import { detainReleaseKeys } from "../detainReleaseKeys"

export function useDetentionRegister(params: DetentionRegisterParams) {
  return useQuery({
    queryKey: detainReleaseKeys.list(params),
    queryFn: () => detainReleaseService.getDetentionRegister(params),
    placeholderData: (previousData) => previousData,
  })
}