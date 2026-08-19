import type { PaginatedResultDto } from "@repo/shared";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedResultDto<T>["meta"];
}