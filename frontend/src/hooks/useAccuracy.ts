import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

export function useAccuracy(
  fromDate?: string,
  toDate?: string,
  cutoffHour = 11,
  cutoffMinute = 0
) {
  return useQuery({
    queryKey: ["accuracy", fromDate, toDate, cutoffHour, cutoffMinute],
    queryFn: () => api.accuracy(fromDate, toDate, cutoffHour, cutoffMinute),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
