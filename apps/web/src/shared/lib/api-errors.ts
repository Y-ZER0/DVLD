// getApiErrorMessage — extracts a human-readable message from an axios
// rejection that carries the backend's error envelope (code-standards.md
// § 4: AllExceptionsFilter returns { success, statusCode, message, path,
// timestamp }; class-validator array messages are joined). Shared by every
// feature's forms/dialogs so server errors surface verbatim (e.g. the 409
// "National number already exists") instead of a generic fallback.

import type { AxiosError } from "axios"

interface ApiErrorBody {
  message?: string | string[]
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  // STEP 1: Only axios rejections carry the envelope; anything else
  //         (validation thrown client-side, network-level failures)
  //         falls back to the caller-provided generic message.
  const axiosError = error as AxiosError<ApiErrorBody>
  const message = axiosError.response?.data?.message

  // STEP 2: class-validator can return an array of messages for one
  //         request — join them so the user sees every failing field.
  if (Array.isArray(message)) {
    return message.length > 0 ? message.join(", ") : fallback
  }

  // STEP 3: a single string message is used as-is; empty/absent falls
  //         through to the fallback so we never render a blank alert.
  if (typeof message === "string" && message.trim().length > 0) {
    return message
  }

  return fallback
}