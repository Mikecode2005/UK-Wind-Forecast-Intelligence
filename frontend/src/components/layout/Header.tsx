import { Calendar, RotateCcw, Loader2 } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { useLocation } from "react-router-dom"

interface HeaderProps {
  onRefresh: () => void
  isLoading: boolean
  lastRefresh: Date | null
  analysisFrom: string
  analysisTo: string
  onDateChange: (from: string, to: string) => void
}

export function Header({
  onRefresh,
  isLoading,
  lastRefresh,
  analysisFrom,
  analysisTo,
  onDateChange,
}: HeaderProps) {
  const location = useLocation()
  const [showDatePicker, setShowDatePicker] = useState(false)

  const pageTitles: Record<string, { title: string; description: string }> = {
    "/": {
      title: "Wind Generation Intelligence",
      description:
        "Historical day-ahead forecast performance and renewable generation analysis.",
    },
    "/forecast-explorer": {
      title: "Forecast Explorer",
      description:
        "Inspect forecast publications and understand what was available before decision deadlines.",
    },
    "/forecast-accuracy": {
      title: "Forecast Accuracy",
      description:
        "Quantitative analysis of wind forecast reliability and error distributions.",
    },
    "/data-quality": {
      title: "Data Quality",
      description: "Validate the completeness and reliability of the underlying data.",
    },
    "/methodology": {
      title: "Methodology",
      description:
        "How the analysis works: data sources, selection rules, and metric definitions.",
    },
  }

  const currentPage = pageTitles[location.pathname] || {
    title: "",
    description: "",
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              {currentPage.title}
            </h1>
            <p className="text-sm text-slate-500">{currentPage.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowDatePicker(true)}
              className="btn-secondary"
            >
              <Calendar className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>
                {format(new Date(analysisFrom), "MMM d, yyyy")} –{" "}
                {format(new Date(analysisTo), "MMM d, yyyy")}
              </span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              )}
              <span>Refresh</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg">
              {lastRefresh ? (
                <>
                  <span>Last updated</span>
                  <span className="font-mono text-slate-700">
                    {format(lastRefresh, "HH:mm:ss")}
                  </span>
                </>
              ) : (
                <span>No data loaded yet</span>
              )}
            </div>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Elexon API
            </span>
          </div>
        </div>
      </div>

      {/* Date picker modal */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/40 transition-opacity ${
          showDatePicker ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowDatePicker(false)}
        aria-hidden="true"
      />
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Select Analysis Period
              </h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                aria-label="Close date picker"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">From</label>
                <input
                  type="date"
                  value={analysisFrom}
                  onChange={(e) => onDateChange(e.target.value, analysisTo)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
                <input
                  type="date"
                  value={analysisTo}
                  onChange={(e) => onDateChange(analysisFrom, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDatePicker(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => setShowDatePicker(false)} className="btn-primary">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
