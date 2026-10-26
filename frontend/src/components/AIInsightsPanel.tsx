import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { api } from "@/services/api"
import type { Accuracy, Overview } from "@/types/api"

interface AIInsightsPanelProps {
  from: string
  to: string
  cutoffHour: number
  overview?: Overview
  accuracy?: Accuracy
}

export function AIInsightsPanel({
  from,
  to,
  cutoffHour,
  overview,
  accuracy,
}: AIInsightsPanelProps) {
  const [text, setText] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.aiInsights({
        fromDate: from,
        toDate: to,
        cutoffHour,
        maeMw: overview?.maeMw ?? accuracy?.maeMw,
        rmseMw: overview?.rmseMw ?? accuracy?.rmseMw,
        biasMw: overview?.biasMw ?? accuracy?.biasMw,
        mapePercent: overview?.mapePercent ?? accuracy?.mapePercent,
        matchedIntervals: overview?.matchedIntervals ?? accuracy?.matchedIntervals,
        dataCoveragePercent: overview?.dataCoveragePercent,
      })
      setText(res.insights)
      setSource(res.source)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate insights")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI analysis</h3>
            <p className="text-[11px] text-slate-500">Procurement-oriented briefing</p>
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Generate
            </>
          )}
        </button>
      </div>

      {!text && !error && !loading && (
        <p className="text-sm text-slate-500 leading-relaxed">
          Generate a short briefing on bias, error magnitude, and what this implies for
          day-ahead buying decisions. Uses <code className="text-xs bg-slate-100 px-1 rounded">AI_API_KEY</code>{" "}
          on the backend when set; otherwise a deterministic rule-based summary.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {text && (
        <div className="space-y-2">
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{text}</div>
          {source && (
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Source: {source}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
