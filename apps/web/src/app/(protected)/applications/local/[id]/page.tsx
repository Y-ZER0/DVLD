import { LocalLicenseApplicationDetailPage } from "@/features/local-license-applications/local-license-application-detail-page"

export default async function LocalApplicationDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LocalLicenseApplicationDetailPage id={Number(id)} />
}