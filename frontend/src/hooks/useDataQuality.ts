import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { DataQuality } from "@/types/api"

export function useDataQuality(
  fromDate?: string,
  toDate?: string,
  cutoffHour = 11,
  cutoffMinute = 0
) {
  return useQuery({
    queryKey: ["dataQuality", fromDate, toDate, cutoffHour, cutoffMinute],
    queryFn: () => api.dataQuality(fromDate, toDate, cutoffHour, cutoffMinute),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}