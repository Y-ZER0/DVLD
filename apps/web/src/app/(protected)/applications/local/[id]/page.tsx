import { LocalLicenseApplicationDetailPage } from "@/features/local-license-applications/local-license-application-detail-page"

// /applications/local/[id] — Local Driving License Application detail
// (Feature 4.2 [UI]). Thin by design (invariant #12): parses the route
// param and delegates. Next 15 passes params as a Promise, hence the
// await. The sidebar's "Local Driving Licenses" entry lights up for this
// deeper path (sidebar-navigation active check).
export default async function LocalApplicationDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LocalLicenseApplicationDetailPage id={Number(id)} />
}