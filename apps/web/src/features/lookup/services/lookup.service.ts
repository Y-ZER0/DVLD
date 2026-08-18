import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from "@repo/shared"

// lookupService — the lookup domain's service layer (invariant #4: the
// ONLY files allowed to touch apiClient for this domain). Pure, stateless
// async functions (invariant #7), one per read-only route the UI consumes.
// The backend exposes the full register as a plain array (Session 11
// decision — no pagination): dropdowns and fee notices need every row, so
// a window could never be correct here.

export const lookupService = {
  // GET /lookup/license-classes — the 7 seeded classes in seed order,
  // each carrying MinimumAllowedAge for the "(Min age N)" option labels.
  async getLicenseClasses(): Promise<LicenseClassDto[]> {
    const { data } = await apiClient.get<ApiResponse<LicenseClassDto[]>>(
      "/lookup/license-classes",
    )
    return data.data
  },

  // GET /lookup/application-types — the 6 seeded application kinds;
  // the modal fee notice reads the NewDrivingLicense row's fees from here
  // (library-docs.md § 8: never hardcode a fee in the UI).
  async getApplicationTypes(): Promise<ApplicationTypeDto[]> {
    const { data } = await apiClient.get<ApiResponse<ApplicationTypeDto[]>>(
      "/lookup/application-types",
    )
    return data.data
  },

  // GET /lookup/test-types — the 3 test stages in Vision → Written → Street
  // order (dashboard/Feature 11 consumers; unused by 4.2 — kept complete).
  async getTestTypes(): Promise<TestTypeDto[]> {
    const { data } = await apiClient.get<ApiResponse<TestTypeDto[]>>("/lookup/test-types")
    return data.data
  },
}