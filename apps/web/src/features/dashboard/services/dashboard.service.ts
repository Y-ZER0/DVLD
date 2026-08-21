import { apiClient } from "@/shared/lib/api-client"
import type { DashboardSummaryDto } from "@repo/shared"

export async function getDashboardSummary(): Promise<DashboardSummaryDto> {
  const { data } = await apiClient.get<DashboardSummaryDto>("/dashboard/summary")
  return data
}
