import { format, isValid, parseISO } from "date-fns"

/** Safely parse YYYY-MM-DD or ISO string; returns null if invalid. */
export function parseSafe(value: string | null | undefined): Date | null {
  if (!value) return null
  try {
    const d = value.includes("T") ? parseISO(value) : parseISO(`${value}T00:00:00`)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

/** Format a date string safely; returns fallback on invalid input. */
export function formatSafe(
  value: string | Date | null | undefined,
  pattern: string,
  fallback = "—"
): string {
  if (value == null || value === "") return fallback
  try {
    const d = typeof value === "string" ? parseSafe(value) : value
    if (!d || !isValid(d)) return fallback
    return format(d, pattern)
  } catch {
    return fallback
  }
}

export function periodLabel(from: string, to: string): string {
  const a = formatSafe(from, "MMM d, yyyy")
  const b = formatSafe(to, "MMM d, yyyy")
  if (a === "—" || b === "—") return "Selected period"
  return `${a} – ${b}`
}

export function isJanuary2026(from: string, to: string): boolean {
  return from.startsWith("2026-01") && to.startsWith("2026-01")
}
