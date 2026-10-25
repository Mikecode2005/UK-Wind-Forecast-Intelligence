import type {
  Accuracy,
  DataQuality,
  ForecastHistory,
  IntervalPoint,
  Overview,
  Timeseries,
} from "@/types/api"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ""

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string }
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export const api = {
  overview: (fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    if (fromDate) qs.set("fromDate", fromDate)
    if (toDate) qs.set("toDate", toDate)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return fetchJson<Overview>(`/api/overview?${qs}`)
  },

  timeseries: (fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    if (fromDate) qs.set("fromDate", fromDate)
    if (toDate) qs.set("toDate", toDate)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return fetchJson<Timeseries>(`/api/timeseries?${qs}`)
  },

  accuracy: (fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    if (fromDate) qs.set("fromDate", fromDate)
    if (toDate) qs.set("toDate", toDate)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return fetchJson<Accuracy>(`/api/accuracy?${qs}`)
  },

  forecastHistory: (intervalStart: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    qs.set("intervalStart", intervalStart)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return fetchJson<ForecastHistory>(`/api/forecasts/history?${qs}`)
  },

  dataQuality: (fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    if (fromDate) qs.set("fromDate", fromDate)
    if (toDate) qs.set("toDate", toDate)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return fetchJson<DataQuality>(`/api/data-quality?${qs}`)
  },

  health: () => fetchJson<{ status: string }>("/api/health"),
}

export type { IntervalPoint }
