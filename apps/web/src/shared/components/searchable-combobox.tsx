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

// SearchableCombobox — the reusable dropdown + type-to-filter picker
// (ui-registry.md Combobox pattern, imprinted Session 10 from the 2.2
// "Link to Person" picker; e.g. Select a citizen / driver picker). Owns
// ONLY its own transient UX state — open/closed and the search text
// (invariant #1). The option DATA is fed in from outside exactly like the
// shared DataTable feeds rows: a feature hook (useUnlinkedPeople today)
// fetches the full option set, and this component filters that set
// client-side as the clerk types. Selecting an option reports the whole
// option object up via onValueChange — the owning form keeps whatever id
// it needs. Pending/error/empty states are handled here so every screen
// that uses a picker gets the same behavior for free.

export interface SearchableComboboxProps<T> {
  /** id for the Label htmlFor pairing (ui-rules.md a11y mandate). */
  id?: string
  /** The currently selected option, or null when nothing is picked. */
  value: T | null
  /** Selection callback — receives the full option object (or null). */
  onValueChange: (value: T | null) => void
  /** The full option set from the feature's query hook. */
  options: T[] | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
  getOptionKey: (option: T) => string | number
  getOptionLabel: (option: T) => string
  /** Optional muted mono text shown right-aligned in each row (e.g. a
   *  national number). */
  getOptionSecondary?: (option: T) => string
  triggerPlaceholder: string
  searchPlaceholder: string
  loadingMessage: string
  errorMessage: string
  /** Shown when the feed exists but is genuinely empty (no options at
   *  all, regardless of search). */
  emptyMessage: string
  /** Shown when a live search matches nothing. */
  noMatchMessage: (search: string) => string
  /** Mirrored onto the trigger as aria-invalid for form validation. */
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
  // STEP 1: Own open/closed + search text — transient UI state, not
  //         server state (invariant #1). The search text resets on every
  //         close so a stale filter never leaks into the next open.
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // STEP 2: Type-to-filter over the FULL option set, client-side. The
  //         feeds that power these pickers are deliberately non-paginated
  //         (e.g. people/unlinked, build-plan.md § 2.1) so a window can
  //         never hide a selectable option.
  const needle = search.trim().toLowerCase()
  const filteredOptions = needle
    ? (options ?? []).filter((option) => {
        const label = getOptionLabel(option).toLowerCase()
        const secondary = getOptionSecondary?.(option)?.toLowerCase() ?? ""
        return label.includes(needle) || secondary.includes(needle)
      })
    : options ?? []

  // STEP 3: Selecting an option reports it up, closes the popover, and
  //         resets the filter — the next open starts clean. The search
  //         also resets on ANY close (escape, outside click) so a stale
  //         filter never leaks into the next open.
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSearch("")
  }

  const handleSelect = (option: T) => {
    onValueChange(option)
    setOpen(false)
    setSearch("")
  }

  // STEP 4: The trigger mirrors the other form controls (h-10, outline)
  //         and shows "Label (Secondary)" for the selection; identity for
  //         the check marker uses the option key, never reference
  //         equality, so a re-fetched array still highlights the pick.
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
            {/* STEP 5: Three feed states inside the list, mutually
                     exclusive like DataTable's body: loading (spinner),
                     error (retry link, role="alert"), else the filtered
                     options with CommandEmpty distinguishing "no match"
                     from "no options at all". */}
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