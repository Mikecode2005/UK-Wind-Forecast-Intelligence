import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import type { ForecastHistoryItem } from "@/types"

interface ForecastHistoryModalProps {
  open: boolean
  onClose: () => void
  intervalStart: string
  cutoff: string
  candidates: ForecastHistoryItem[]
  selectedPublishTime: string | null
}

export function ForecastHistoryModal({
  open,
  onClose,
  intervalStart,
  cutoff,
  candidates,
  selectedPublishTime,
}: ForecastHistoryModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-x-0 bottom-0 z-50 w-full max-w-md mt-4 md:inset-0 md:max-w-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:mt-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Forecast publication history</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Interval</span>
                <span className="font-mono text-slate-200">{format(new Date(intervalStart), "dd MMM yyyy HH:mm")} UTC</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Decision cutoff</span>
                <span className="font-mono text-slate-200">{format(new Date(cutoff), "dd MMM yyyy HH:mm")} UTC</span>
              </div>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="pb-2 text-slate-500 font-medium">Published</th>
                    <th className="pb-2 text-slate-500 font-medium text-right">Forecast (MW)</th>
                    <th className="pb-2 text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => {
                    const selected = c.publishTime === selectedPublishTime
                    const afterCutoff = new Date(c.publishTime) > new Date(cutoff)
                    return (
                      <tr
                        key={c.publishTime}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                          selected ? "bg-slate-800/50" : ""
                        }`}
                      >
                        <td className="py-2 text-slate-300 font-mono">
                          {format(new Date(c.publishTime), "dd MMM HH:mm")}
                        </td>
                        <td className="py-2 text-right text-slate-200">{c.generationMw.toFixed(1)}</td>
                        <td className="py-2">
                          {selected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-energy-green/20 text-energy-green border border-energy-green/50">
                              <ChevronRight size={12} /> selected
                            </span>
                          ) : afterCutoff ? (
                            <span className="text-[10px] text-slate-500">after cutoff</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {selectedPublishTime && (
              <p className="text-[10px] text-slate-400 mt-2">
                Selected forecast:{selectedPublishTime ? ` ${format(new Date(selectedPublishTime), "dd MMM HH:mm")} UTC` : " none eligible before cutoff"}
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
