import { motion } from "framer-motion"

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
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative bg-white border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow ${
        highlight
          ? "border-brand-200 ring-1 ring-brand-100"
          : "border-slate-200"
      }`}
    >
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-brand-500 to-brand-400" />
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </h3>
        {highlight && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-700">
            Key
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>
      )}

      {trend && (
        <p
          className={`text-[11px] font-medium mt-2 ${
            trend.startsWith("-") ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {trend}
        </p>
      )}
    </motion.div>
  )
}
