import type {
  Accuracy,
  ApiError,
  ForecastHistory,
  IntervalPoint,
  Overview,
  Timeseries,
} from "@/types"

const API_BASE = import.meta.env.VITE_API_BASE ?? ""

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    // Do not send credentials cross-origin by default; opt in where hosted together.
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError
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
    return request<Overview>(`/api/overview?${qs}`)
  },
  timeseries: (fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    if (fromDate) qs.set("fromDate", fromDate)
    if (toDate) qs.set("toDate", toDate)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return request<Timeseries>(`/api/timeseries?${qs}`)
  },
  accuracy: (fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) => {
    const qs = new URLSearchParams()
    if (fromDate) qs.set("fromDate", fromDate)
    if (toDate) qs.set("toDate", toDate)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return request<Accuracy>(`/api/accuracy?${qs}`)
  },
  forecastHistory: (
    intervalStart: string,
    cutoffHour = 11,
    cutoffMinute = 0
  ) => {
    const qs = new URLSearchParams()
    qs.set("intervalStart", intervalStart)
    qs.set("cutoffHour", String(cutoffHour))
    qs.set("cutoffMinute", String(cutoffMinute))
    return request<ForecastHistory>(`/api/forecasts/history?${qs}`)
  },
  health: () => request<{ status: string }>("/api/health"),
}

export type { IntervalPoint }
