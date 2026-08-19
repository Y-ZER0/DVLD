"use client"

import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

export function useUsers(params: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () =>
      userService.getUsers({
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      }),
    staleTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
  })
}