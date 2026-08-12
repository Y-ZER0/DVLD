// The envelope every successful API response is wrapped in
// (code-standards.md § 4): { success: true, data }. Services unwrap
// `data` before returning; error responses are shaped server-side by
// AllExceptionsFilter (success: false) and rejected through axios — they
// are never typed here.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}