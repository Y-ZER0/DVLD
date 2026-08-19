import axios from "axios"
import { useAuthStore } from "../stores/auth.store"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ""
    if (error.response?.status === 401 && !url.includes("/auth/login")) {
      useAuthStore.getState().clearAuth()
      window.location.replace("/")
    }
    return Promise.reject(error)
  },
)