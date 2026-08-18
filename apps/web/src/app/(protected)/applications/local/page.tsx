import { LocalLicenseApplicationsPage } from "@/features/local-license-applications/local-license-applications-page"

// /applications/local — Local Driving License Applications (Feature 4.2
// [UI]). Thin by design (invariant #12): composition only, all state lives
// in LocalLicenseApplicationsPage and LocalLicenseApplicationsList. The
// sidebar's "Local Driving Licenses" entry (nav-config.ts) already points
// here; this route was a 404 until now.
export default function LocalApplicationsRoute() {
  return <LocalLicenseApplicationsPage />
}