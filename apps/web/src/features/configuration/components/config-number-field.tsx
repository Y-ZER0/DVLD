"use client"

import { useEffect, useRef, useState } from "react"
import { Check, CircleAlert, LoaderCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/shared/lib/api-errors"

interface ConfigNumberFieldProps {
  value: string | number
  onSave: (next: number) => Promise<unknown>
  saving?: boolean
  min?: number
  max?: number
  integer?: boolean
  maxDecimals?: number
  ariaLabel: string
  className?: string
}

export function ConfigNumberField({
  value,
  onSave,
  saving = false,
  min,
  max,
  integer = false,
  maxDecimals = 2,
  ariaLabel,
  className,
}: ConfigNumberFieldProps) {
  const displayValue = String(value ?? "")
  const normalizedDisplay =
    displayValue.trim() !== "" && !Number.isNaN(Number(displayValue))
      ? stripTrailingZeros(displayValue)
      : displayValue
  const [localValue, setLocalValue] = useState(normalizedDisplay)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [internalSaving, setInternalSaving] = useState(false)
  const focusedRef = useRef(false)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!focusedRef.current) {
      setLocalValue(normalizedDisplay)
    }
  }, [normalizedDisplay])

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  function stripTrailingZeros(raw: string): string {
    const num = Number(raw)
    if (!Number.isFinite(num)) return raw
    return num.toString()
  }

  function validate(raw: string): string | null {
    const trimmed = raw.trim()
    if (trimmed === "") return "Required"
    const num = Number(trimmed)
    if (!Number.isFinite(num)) return "Enter a valid number"
    if (integer && !Number.isInteger(num)) return "Must be a whole number"
    if (min !== undefined && num < min) return `Minimum is ${min}`
    if (max !== undefined && num > max) return `Maximum is ${max}`
    if (!integer && maxDecimals !== undefined) {
      const parts = trimmed.split(".")
      if (parts[1] && parts[1].length > maxDecimals) return `Max ${maxDecimals} decimals`
      if (Math.round(num * 100) / 100 !== num) return `Max ${maxDecimals} decimals`
    }
    return null
  }

  async function commit() {
    setError(null)
    const validationError = validate(localValue)
    if (validationError) {
      setError(validationError)
      setLocalValue(normalizedDisplay)
      return
    }
    const next = Number(localValue.trim())
    const current = Number(String(value).trim())
    if (next === current && stripTrailingZeros(localValue.trim()) === normalizedDisplay) {
      setLocalValue(normalizedDisplay)
      return
    }
    setInternalSaving(true)
    try {
      await onSave(next)
      setSaved(true)
      setError(null)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save"))
      setLocalValue(normalizedDisplay)
    } finally {
      setInternalSaving(false)
    }
  }

  const isBusy = saving || internalSaving

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative">
        <Input
          aria-label={ariaLabel}
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value)
            if (error) setError(null)
            if (saved) setSaved(false)
          }}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={() => {
            focusedRef.current = false
            void commit()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              ;(e.currentTarget as HTMLInputElement).blur()
            }
            if (e.key === "Escape") {
              setLocalValue(normalizedDisplay)
              setError(null)
              ;(e.currentTarget as HTMLInputElement).blur()
            }
          }}
          disabled={isBusy}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-8 w-[72px] rounded-lg border-input bg-card px-2.5 text-sm shadow-sm focus-visible:ring-1",
            error && "border-destructive focus-visible:ring-destructive/20",
            saved && !error && "border-success/40 focus-visible:ring-success/20",
          )}
        />
      </div>
      <span className="inline-flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
        {isBusy ? (
          <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
        ) : saved && !error ? (
          <Check className="size-3.5 text-success" />
        ) : error ? (
          <CircleAlert className="size-3.5 text-destructive" />
        ) : null}
      </span>
      <span aria-live="polite" className="sr-only">
        {isBusy ? "Saving" : saved && !error ? "Saved" : error ?? ""}
      </span>
      {error ? (
        <span className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
