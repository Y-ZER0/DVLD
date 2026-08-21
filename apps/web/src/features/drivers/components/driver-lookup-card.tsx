"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface DriverLookupCardProps {
  defaultValue?: string
  onSearch: (term: string) => void
}

export function DriverLookupCard({ defaultValue = "", onSearch }: DriverLookupCardProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="text-base font-semibold">Driver Lookup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a National Number (e.g. N-30871234), Driver ID, or name.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              className="h-10 pl-9"
              placeholder="National ID, Driver ID, or name..."
              aria-label="Search drivers"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <Button type="submit" className="h-10 shrink-0 sm:w-auto">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
