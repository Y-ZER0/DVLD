import { DriversDetailPage } from "@/features/drivers/drivers-detail-page"

export default async function DriverDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  return <DriversDetailPage id={Number(id)} initialSearch={query.search ?? ""} />
}
