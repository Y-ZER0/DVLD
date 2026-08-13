// The envelope every successful API response is wrapped in
// (code-standards.md § 4): { success: true, data }. Services unwrap
// `data` before returning; error responses are shaped server-side by
// AllExceptionsFilter (success: false) and rejected through axios — they
// are never typed here.
import type { PaginatedResultDto } from "@repo/shared";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Paginated list envelope — same shape plus the meta block, whose shape is
// defined exactly once in @repo/shared (invariant #9: PaginatedResultDto).
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedResultDto<T>["meta"];
}