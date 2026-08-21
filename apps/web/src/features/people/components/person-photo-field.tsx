"use client"

import { useEffect, useState } from "react"
import { ImageIcon, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buildPersonPhotoUrl } from "@/shared/lib/imagekit"

interface PersonPhotoFieldProps {
  value?: string | null
  onFileSelect: (file: File | null) => void
  onClearExisting: () => void
  disabled?: boolean
  fallbackInitials: string
}

export function PersonPhotoField({
  value,
  onFileSelect,
  onClearExisting,
  disabled,
  fallbackInitials,
}: PersonPhotoFieldProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    setPreview(null)
  }, [value])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const displaySrc = preview ?? buildPersonPhotoUrl(value ?? undefined, { thumbnail: 96 })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (preview) URL.revokeObjectURL(preview)
    if (file) {
      setPreview(URL.createObjectURL(file))
      onFileSelect(file)
    } else {
      setPreview(null)
      onFileSelect(null)
    }
  }

  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
      onFileSelect(null)
    } else if (value) {
      onClearExisting()
    }
  }

  const hasPhoto = Boolean(preview ?? value)

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
      <Avatar className="size-16 shrink-0 rounded-xl">
        {displaySrc ? <AvatarImage src={displaySrc} alt="Person photo" className="rounded-xl object-cover" /> : null}
        <AvatarFallback className="rounded-xl bg-primary/10 text-base font-semibold text-primary">
          {fallbackInitials || <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor="photoFile" className="text-sm font-medium">
          Photo
        </Label>
        <div className="flex min-w-0 items-center gap-2">
          <Input
            id="photoFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={disabled}
            className="h-10 min-w-0 flex-1 cursor-pointer truncate file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />
          {hasPhoto && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 text-destructive hover:text-destructive"
              onClick={handleClear}
              disabled={disabled}
              aria-label="Remove photo"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
