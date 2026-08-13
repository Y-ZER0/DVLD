"use client"

import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

// useUsers — paginated + searchable account list backing the 2.2
// DataTable. The key carries the full filter (search/page/pageSize) so
// every distinct combination is cached separately (invariant #5). The
// 5-minute staleTime mirrors usePeople: accounts only change through
// clerk mutations, which invalidate these lists anyway.

export function useUsers(params: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () =>
      userService.getUsers({
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      }),
    // STEP 1: Don't refetch churn while a clerk types or pages — account
    //         data changes rarely and every mutation invalidates.
    staleTime: 5 * 60_000,
    // STEP 2: Keep the previous page's rows visible while a new
    //         page/search resolves — the table never flashes empty.
    placeholderData: (previousData) => previousData,
  })
}