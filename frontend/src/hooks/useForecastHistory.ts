import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

export function useForecastHistory(
  intervalStart?: string,
  cutoffHour = 11,
  cutoffMinute = 0
) {
  return useQuery({
    queryKey: ["forecastHistory", intervalStart, cutoffHour, cutoffMinute],
    queryFn: () =>
      api.forecastHistory(intervalStart!, cutoffHour, cutoffMinute),
    enabled: !!intervalStart,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
