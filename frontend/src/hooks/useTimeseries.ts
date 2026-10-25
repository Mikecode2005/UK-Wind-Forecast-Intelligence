import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

export function useTimeseries(
  fromDate?: string,
  toDate?: string,
  cutoffHour = 11,
  cutoffMinute = 0
) {
  return useQuery({
    queryKey: ["timeseries", fromDate, toDate, cutoffHour, cutoffMinute],
    queryFn: () => api.timeseries(fromDate, toDate, cutoffHour, cutoffMinute),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
