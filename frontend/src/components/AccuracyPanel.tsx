import type { Accuracy } from "@/types"

interface AccuracyPanelProps {
  accuracy: Accuracy
}

export function AccuracyPanel({ accuracy }: AccuracyPanelProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Forecast accuracy
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {accuracy.matchedIntervals} matched intervals
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
            MAE
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {accuracy.maeMw.toFixed(1)} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">avg |error|</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
            RMSE
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {accuracy.rmseMw.toFixed(1)} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">penalises large errors</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
            Mean bias
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {accuracy.biasMw >= 0 ? "+" : ""}{accuracy.biasMw.toFixed(1)} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            forecast − actual
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
            MAPE
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {accuracy.mapePercent == null ? "n/a" : accuracy.mapePercent.toFixed(1) + "%"}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            zero-actuals excluded
          </div>
        </div>
      </div>
    </div>
  )
}
