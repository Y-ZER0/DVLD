"use client"

import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

export function useUnlinkedPeople() {
  return useQuery({
    queryKey: usersKeys.unlinkedPeople(),
    queryFn: () => userService.getUnlinkedPeople(),
    staleTime: 5 * 60_000,
  })
}