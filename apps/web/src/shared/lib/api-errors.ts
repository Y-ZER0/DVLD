import type { AxiosError } from "axios"

interface ApiErrorBody {
  message?: string | string[]
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorBody>
  const message = axiosError.response?.data?.message

  if (Array.isArray(message)) {
    return message.length > 0 ? message.join(", ") : fallback
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message
  }

  return fallback
}