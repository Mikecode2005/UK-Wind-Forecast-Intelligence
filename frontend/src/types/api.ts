export interface IntervalPoint {
  startTime: string
  settlementPeriod: number
  actualMw: number | null
  forecastMw: number | null
  forecastPublishTime: string | null
  errorMw: number | null
  matched: boolean
}

export interface Overview {
  period: string
  totalIntervals: number
  matchedIntervals: number
  unmatchedIntervals: number
  dataCoveragePercent: number
  maeMw: number | null
  rmseMw: number | null
  biasMw: number | null
  mapePercent: number | null
  forecastCutoff: string
  cutoffNote: string
}

export interface Accuracy {
  period: string
  matchedIntervals: number
  maeMw: number
  rmseMw: number
  biasMw: number
  mapePercent: number | null
  meanActualMw: number
  meanForecastMw: number
  intervals: IntervalPoint[]
}

export interface Timeseries {
  period: string
  cutoff: string
  points: IntervalPoint[]
}

export interface ForecastHistoryItem {
  startTime: string
  publishTime: string
  generationMw: number
}

export interface ForecastHistory {
  intervalStart: string
  candidates: ForecastHistoryItem[]
  selectedPublishTime: string | null
  cutoff: string
}

export interface DataQuality {
  actualsRetrieved: number
  forecastsRetrieved: number
  matchedIntervals: number
  missingActuals: number
  missingEligibleForecasts: number
  duplicates: number
  invalidValues: number
  excludedAfterCutoff: number
  retrievalTimeMs: number
  sourceStatus: string
}

export interface ApiError {
  error: string
  detail?: string
}