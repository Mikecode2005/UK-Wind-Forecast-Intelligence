import { ChevronDown, Database, Wifi, ArrowRight } from "lucide-react"
import { useState } from "react"

export function MethodologyPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const sections = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p>
            This application analyzes wind generation forecast accuracy for the UK electricity market.
            It compares day-ahead wind generation forecasts published by Elexon against the actual
            generation subsequently recorded, using the forecast vintage that would have been available
            to a procurement team making day-ahead purchasing decisions.
          </p>
          <p>
            The analysis covers January 2026 (31 days × 48 half-hour periods = 1,488 expected intervals).
            All timestamps are handled in Europe/London timezone (GMT in January) and converted to UTC
            for comparison with Elexon's API responses.
          </p>
        </div>
      )},
    {
      id: "data-sources",
      title: "Data Sources",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">Elexon BMRS Datasets</h4>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-4">
              <dt className="font-medium w-40"><Database className="w-4 h-4 inline mr-1" /> FUELHH</dt>
              <dd className="text-slate-600 dark:text-slate-300">Actual generation by fuel type, half-hourly resolution. We filter for fuelType = "WIND".</dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-40"><Wifi className="w-4 h-4 inline mr-1" /> WINDFOR</dt>
              <dd className="text-slate-600 dark:text-slate-300">Wind generation forecasts with publishTime and startTime (hourly resolution).</dd>
            </div>
          </dl>
          <p>All data retrieved from <a href="https://data.elexon.co.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Elexon Data Portal</a> via the BMRS API.</p>
        </div>
      )},
    {
      id: "forecast-selection",
      title: "Forecast Selection Logic",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p>The core analytical decision is which forecast vintage to compare against each actual. This application implements a historically accurate reconstruction:</p>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>For each half-hour delivery interval, determine the decision day (delivery date − 1, UK local time).</li>
            <li>Compute the decision cutoff on that day (default 11:00 UK, configurable).</li>
            <li>Consider WINDFOR forecasts whose startTime hour contains the delivery interval and whose publishTime is on or before the cutoff.</li>
            <li>Select the eligible forecast with the latest publishTime.</li>
            <li>If no eligible forecast exists, the interval is flagged as unmatched.</li>
          </ol>
          <p className="text-amber-700 dark:text-amber-300 font-medium"><strong>Important:</strong> The 11:00 default cutoff is a modelling assumption, not a verified trading deadline. It is configurable via the API.</p>
        </div>
      )},
    {
      id: "matching",
      title: "Actuals & Forecast Matching",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p><strong>FUELHH:</strong> Elexon republishes settlement periods as data is refined. For each delivery startTime we keep the latest publish as the final actual outturn.</p>
          <p><strong>WINDFOR:</strong> Forecasts are hourly; each is applied to both half-hour periods within its hour.</p>
          <p>Actuals and selected forecasts are joined on exact delivery startTime. Intervals missing a forecast or an actual are reported as unmatched so incomplete data never inflates apparent accuracy.</p>
        </div>
      )},
    {
      id: "metrics",
      title: "Accuracy Metrics",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <dl className="space-y-3">
            <div><dt className="font-medium">MAE (Mean Absolute Error)</dt><dd>Mean of |forecast − actual| in MW.</dd></div>
            <div><dt className="font-medium">RMSE (Root Mean Squared Error)</dt><dd>Square root of mean squared error. Penalizes large deviations more heavily.</dd></div>
            <div><dt className="font-medium">Mean Bias</dt><dd>Mean of (forecast − actual). Positive = overforecasting tendency.</dd></div>
            <div><dt className="font-medium">MAPE</dt><dd>Mean absolute percentage error. Zero and near-zero actuals are excluded from the denominator to avoid division artifacts. The number of excluded observations is reported.</dd></div>
            <div><dt className="font-medium">Data Coverage</dt><dd>Matched intervals / expected intervals (1,488 for January 2026).</dd></div>
          </dl>
        </div>
      )},
    {
      id: "limitations",
      title: "Limitations & Assumptions",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside space-y-2">
            <li>The decision cutoff (default 11:00 UK on D-1) is a modelling assumption, not a verified market gate closure.</li>
            <li>WINDFOR data in the supplied period is hourly; each forecast applies to both half-hour periods of its hour.</li>
            <li>Historical data availability may be incomplete; missing publications are reported transparently.</li>
            <li>This is strictly historical analysis for January 2026. The interface does not imply historical data is a live forecast for future delivery.</li>
            <li>Procurement insight (residual demand) is shown for context only—demand data and other generation are outside scope.</li>
          </ul>
        </div>
      )},
    {
      id: "pipeline",
      title: "Analytical Pipeline",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p className="font-medium">Elexon source records → validation and normalization → historical forecast selection → delivery timestamp matching → accuracy calculations → dashboard</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Source</span>
            <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Validate</span>
            <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">Select</span>
            <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Match</span>
            <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Calculate</span>
            <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">Display</span>
          </div>
        </div>
      )},
    {
      id: "timestamp-handling",
      title: "Timestamp Handling",
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p>All timestamps from Elexon are UTC. Delivery dates are UK local market dates (Europe/London timezone) converted to UTC for comparison. January is GMT, so local == UTC, but the conversion logic handles DST boundaries correctly year-round.</p>
          <p>Publication timestamps and the selected decision cutoff are displayed alongside every result so the vintage of each forecast is transparent.</p>
        </div>
      )},
  ]

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Methodology</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">How the analysis works: data sources, selection rules, and metric definitions.</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-xl bg-white dark:bg-slate-950 overflow-hidden">
            <button
              onClick={() => setOpenSections((prev) => ({ ...prev, [section.id]: !openSections[section.id] }))}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections[section.id] ? "rotate-180" : ""}`} />
            </button>
            {openSections[section.id] && (
              <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
