"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export interface SearchableComboboxProps<T> {
  id?: string
  value: T | null
  onValueChange: (value: T | null) => void
  options: T[] | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
  getOptionKey: (option: T) => string | number
  getOptionLabel: (option: T) => string
  getOptionSecondary?: (option: T) => string
  triggerPlaceholder: string
  searchPlaceholder: string
  loadingMessage: string
  errorMessage: string
  emptyMessage: string
  noMatchMessage: (search: string) => string
  invalid?: boolean
}

export function SearchableCombobox<T>({
  id,
  value,
  onValueChange,
  options,
  isPending,
  isError,
  onRetry,
  getOptionKey,
  getOptionLabel,
  getOptionSecondary,
  triggerPlaceholder,
  searchPlaceholder,
  loadingMessage,
  errorMessage,
  emptyMessage,
  noMatchMessage,
  invalid,
}: SearchableComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const needle = search.trim().toLowerCase()
  const filteredOptions = needle
    ? (options ?? []).filter((option) => {
        const label = getOptionLabel(option).toLowerCase()
        const secondary = getOptionSecondary?.(option)?.toLowerCase() ?? ""
        return label.includes(needle) || secondary.includes(needle)
      })
    : options ?? []

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSearch("")
  }

  const handleSelect = (option: T) => {
    onValueChange(option)
    setOpen(false)
    setSearch("")
  }

  const isSelected = (option: T) =>
    value !== null && getOptionKey(value) === getOptionKey(option)

  const triggerText = value
    ? `${getOptionLabel(value)}${getOptionSecondary ? ` (${getOptionSecondary(value)})` : ""}`
    : triggerPlaceholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className="h-10 w-full justify-between bg-card font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {triggerText}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {isPending ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                {loadingMessage}
              </div>
            ) : isError ? (
              <div className="py-6 text-center" role="alert">
                <p className="text-sm text-destructive">{errorMessage}</p>
                <Button type="button" variant="link" className="mt-1 h-auto p-0" onClick={onRetry}>
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {search.trim() ? noMatchMessage(search.trim()) : emptyMessage}
                </CommandEmpty>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={getOptionKey(option)}
                    className="cursor-pointer data-selected:bg-accent"
                    onSelect={() => handleSelect(option)}
                  >
                    <span className="truncate">{getOptionLabel(option)}</span>
                    {getOptionSecondary && (
                      <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                        {getOptionSecondary(option)}
                      </span>
                    )}
                    <Check
                      aria-hidden="true"
                      className={cn(
                        "ml-1 size-4 text-primary",
                        isSelected(option) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}