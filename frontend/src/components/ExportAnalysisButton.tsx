import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import type { Accuracy, Overview } from "@/types/api"
import { periodLabel } from "@/lib/dates"

interface ExportAnalysisButtonProps {
  overview?: Overview
  accuracy?: Accuracy
  from: string
  to: string
  cutoffHour: number
}

export function ExportAnalysisButton({
  overview,
  accuracy,
  from,
  to,
  cutoffHour,
}: ExportAnalysisButtonProps) {
  const [busy, setBusy] = useState(false)

  const exportPdf = async () => {
    setBusy(true)
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const margin = 48
      let y = margin
      const line = (text: string, size = 11, style: "normal" | "bold" = "normal") => {
        doc.setFont("helvetica", style)
        doc.setFontSize(size)
        const lines = doc.splitTextToSize(text, 500)
        doc.text(lines, margin, y)
        y += lines.length * (size + 4) + 4
        if (y > 780) {
          doc.addPage()
          y = margin
        }
      }

      line("Wind Forecast Intelligence", 18, "bold")
      line("Day-ahead procurement analysis report", 12)
      y += 8
      line(`Period: ${periodLabel(from, to)}`, 11)
      line(`Decision cutoff: ${cutoffHour}:00 UK (D-1)`, 11)
      line(`Generated: ${new Date().toISOString()}`, 10)
      y += 12

      line("Key metrics", 14, "bold")
      const mae = overview?.maeMw ?? accuracy?.maeMw
      const rmse = overview?.rmseMw ?? accuracy?.rmseMw
      const bias = overview?.biasMw ?? accuracy?.biasMw
      const mape = overview?.mapePercent ?? accuracy?.mapePercent
      const matched = overview?.matchedIntervals ?? accuracy?.matchedIntervals
      const coverage = overview?.dataCoveragePercent

      line(`MAE: ${mae != null ? mae.toFixed(1) + " MW" : "—"}`)
      line(`RMSE: ${rmse != null ? rmse.toFixed(1) + " MW" : "—"}`)
      line(
        `Bias: ${bias != null ? (bias >= 0 ? "+" : "") + bias.toFixed(1) + " MW" : "—"}`
      )
      line(`MAPE: ${mape != null ? mape.toFixed(1) + "%" : "—"}`)
      line(`Matched intervals: ${matched != null ? matched.toLocaleString() : "—"}`)
      if (coverage != null) line(`Data coverage: ${coverage.toFixed(1)}%`)

      y += 12
      line("Interpretation", 14, "bold")
      if (bias != null && bias > 0) {
        line(
          "Forecasts systematically overestimated wind generation over this period. Procurement should treat day-ahead wind as partially unreliable and hold additional flexible capacity or hedges against positive forecast error."
        )
      } else if (bias != null && bias < 0) {
        line(
          "Forecasts systematically underestimated wind generation. There is a risk of over-procuring thermal/other energy relative to realised wind."
        )
      } else {
        line("Bias is near neutral or data is incomplete for a strong directional call.")
      }

      if (mae != null) {
        line(
          `Typical absolute error is about ${mae.toFixed(0)} MW. Day-ahead positions should allow for errors of this magnitude when converting wind forecasts into residual demand to buy.`
        )
      }

      y += 12
      line("Methodology note", 14, "bold")
      line(
        "For each half-hour delivery interval, the analysis selects the latest WINDFOR forecast published before the configured D-1 cutoff. Metrics compare that selected vintage against FUELHH WIND actuals from Elexon BMRS. This is a historical pilot analysis, not a live operational forecast."
      )

      y += 16
      line("— End of report —", 10)

      doc.save(`wind-forecast-analysis_${from}_${to}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={exportPdf}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-brand-700 text-xs font-semibold hover:bg-brand-50 transition-colors disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileDown className="w-3.5 h-3.5" />
      )}
      Export PDF
    </button>
  )
}
