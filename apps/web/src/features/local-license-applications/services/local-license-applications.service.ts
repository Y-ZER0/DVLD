import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { ApplicationStatus, LocalDrivingLicenseApplicationDto, PersonDto } from "@repo/shared"
import type { CreateLocalLicenseApplicationRequestDto } from "../create-local-license-application-request.dto"

// localLicenseApplicationsService — the applications feature's service
// layer (invariant #4: the ONLY files allowed to touch apiClient for this
// feature). Pure, stateless async functions (invariant #7), one per 4.1
// endpoint. getCitizenOptions hits a people-domain route (GET /people)
// because the "Select a citizen" combobox feed lives there on the
// backend — the frontend feature boundary is preserved (invariant #13,
// same precedent as userService.getUnlinkedPeople).

export interface LocalLicenseApplicationListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: ApplicationStatus
}

// Maximum window for the citizen feed — see getCitizenOptions.
const CITIZEN_OPTIONS_PAGE_SIZE = 1000

export const localLicenseApplicationsService = {
  // GET /local-license-applications — paginated application register,
  // free-text search (applicant name/national number) + optional exact
  // status filter, newest first.
  async getLocalLicenseApplications(
    params: LocalLicenseApplicationListParams,
  ): Promise<{
    data: LocalDrivingLicenseApplicationDto[]
    meta: PaginatedApiResponse<LocalDrivingLicenseApplicationDto>["meta"]
  }> {
    const { data } = await apiClient.get<PaginatedApiResponse<LocalDrivingLicenseApplicationDto>>(
      "/local-license-applications",
      { params },
    )
    return { data: data.data, meta: data.meta }
  },

  // GET /local-license-applications/:id — one application with the full
  // applicant summary, for the 4.2 detail screen.
  async getLocalLicenseApplication(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    const { data } = await apiClient.get<ApiResponse<LocalDrivingLicenseApplicationDto>>(
      `/local-license-applications/${id}`,
    )
    return data.data
  },

  // POST /local-license-applications — files a new application; the
  // backend 400s on an underage applicant (age gate) and 404s on an
  // unknown citizen or class, surfaced verbatim by the modal.
  async createLocalLicenseApplication(
    dto: CreateLocalLicenseApplicationRequestDto,
  ): Promise<LocalDrivingLicenseApplicationDto> {
    const { data } = await apiClient.post<ApiResponse<LocalDrivingLicenseApplicationDto>>(
      "/local-license-applications",
      dto,
    )
    return data.data
  },

  // PATCH /local-license-applications/:id/cancel — the one-way door
  // (New → Cancelled); the backend 409s on an already-cancelled or
  // Completed application.
  async cancelApplication(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    const { data } = await apiClient.patch<ApiResponse<LocalDrivingLicenseApplicationDto>>(
      `/local-license-applications/${id}/cancel`,
    )
    return data.data
  },

  // GET /people (page 1, generous window) — the full citizen set for the
  // "Select a citizen" combobox. The picker needs EVERY option (a page
  // window would hide selectable citizens, ui-registry Combobox note), and
  // no dedicated /people/options endpoint exists yet — so the feed rides
  // the paginated register with a window large enough for this office's
  // registry. Flaggable follow-up: a dedicated plain-array endpoint when
  // the registry outgrows the window.
  async getCitizenOptions(): Promise<PersonDto[]> {
    const { data } = await apiClient.get<PaginatedApiResponse<PersonDto>>("/people", {
      params: { page: 1, pageSize: CITIZEN_OPTIONS_PAGE_SIZE },
    })
    return data.data
  },
}