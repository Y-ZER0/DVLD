import axios from "axios"
import { useAuthStore } from "../stores/auth.store"

// apiClient — the single axios instance every feature service goes through
// (architecture.md § Authentication & Core Patterns, invariant #4:
// components never call axios directly, only services do). It owns the two
// cross-cutting concerns of session transport: attaching the bearer token
// to every outgoing request, and reacting to a rejected token (401) by
// clearing the session and returning to the login screen.

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

apiClient.interceptors.request.use((config) => {
  // STEP 1: Read the token through the store's getState() — safe outside
  //         React (this is module scope), and the single sanctioned source
  //         of the session (library-docs.md § 6). Never localStorage.
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // STEP 1: A 401 means the server rejected our credentials — the token
    //         is stale, invalid, or the account was deactivated. The whole
    //         session is worthless now, so clear it and hard-navigate to
    //         the login route (/) (library-docs.md § 6, fullstack plan § 8.1).
    // STEP 2: BUT a 401 from the login endpoint itself must NOT redirect:
    //         login fails with bad credentials all the time, and the form
    //         shows that error inline. Redirecting there would refresh the
    //         page and wipe the error message the user needs to see.
    const url = error.config?.url ?? ""
    if (error.response?.status === 401 && !url.includes("/auth/login")) {
      useAuthStore.getState().clearAuth()
      window.location.replace("/")
    }
    return Promise.reject(error)
  },
)