
interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  highlight?: boolean
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  highlight = false,
}: KPICardProps) {
  return (
    <div
      className={`border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50 dark:bg-slate-900/60 ${
        highlight ? "ring-1 ring-energy-blue" : ""
      }`}
    >
      <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      )}
      {trend && (
        <p className="text-[10px] font-medium mt-2 {trend.startsWith('-') ? 'text-energy-red' : 'text-energy-green'}">
          {trend}
        </p>
      )}
    </div>
  )
}
