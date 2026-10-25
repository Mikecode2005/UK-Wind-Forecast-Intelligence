import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

export function useOverview(
  fromDate?: string,
  toDate?: string,
  cutoffHour = 11,
  cutoffMinute = 0
) {
  return useQuery({
    queryKey: ["overview", fromDate, toDate, cutoffHour, cutoffMinute],
    queryFn: () => api.overview(fromDate, toDate, cutoffHour, cutoffMinute),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useOverviewQuery(fromDate?: string, toDate?: string, cutoffHour = 11, cutoffMinute = 0) {
  return useQuery({
    queryKey: ["overview", fromDate, toDate, cutoffHour, cutoffMinute],
    queryFn: () => api.overview(fromDate, toDate, cutoffHour, cutoffMinute),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}