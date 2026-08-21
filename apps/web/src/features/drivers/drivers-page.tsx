"use client"

import { useEffect, useState } from "react"
import { DriverDirectoryTable } from "./components/driver-directory-table"
import { DriverLookupCard } from "./components/driver-lookup-card"

interface DriversPageProps {
  initialSearch?: string
}

export function DriversPage({ initialSearch = "" }: DriversPageProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)

  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Drivers &amp; History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Look up any registered driver by National ID or Driver ID to view their complete audit
          trail.
        </p>
      </div>

      <DriverLookupCard defaultValue={searchTerm} onSearch={handleSearch} />

      <DriverDirectoryTable searchTerm={searchTerm} onClearSearch={handleClearSearch} />
    </div>
  )
}
