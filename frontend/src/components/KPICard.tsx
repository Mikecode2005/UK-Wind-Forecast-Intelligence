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
      whileHover={{ y: -4 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`border rounded-xl p-5 bg-slate-50 dark:bg-slate-900/60 ${
        highlight
          ? "border-energy-blue/50 ring-1 ring-energy-blue/20 shadow-[0_0_20px_rgba(14,165,233,0.12)]"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        {highlight && (
          <div className="h-1 w-6 rounded-full bg-energy-blue/20"></div>
        )}
      </div>
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="text-2xl font-bold text-slate-900 dark:text-slate-100 block"
      >
        {value}
      </motion.span>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      )}
      {trend && (
        <p className={`text-[10px] font-medium mt-2 ${trend.startsWith("-") ? "text-energy-red" : "text-energy-green"}`}>
          {trend}
        </p>
      )}
    </motion.div>
  )
}
