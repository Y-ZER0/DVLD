import { DriversPage } from "@/features/drivers/drivers-page"

export default async function DriversRoute({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  return <DriversPage initialSearch={params.search ?? ""} />
}
