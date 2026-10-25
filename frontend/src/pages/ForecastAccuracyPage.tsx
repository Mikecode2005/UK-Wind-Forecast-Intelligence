import { useState } from 'react'
import { format } from 'date-fns'
import { BarChart2 } from 'lucide-react'
import { api } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import { FilterBar } from '@/components/FilterBar'
import { AccuracyPanel } from '@/components/AccuracyPanel'
import { ActualVsForecastChart } from '@/components/ActualVsForecastChart'
import { ErrorAnalysisChart } from '@/components/ErrorAnalysisChart'
import { MethodologyPanel } from '@/components/MethodologyPanel'

export function ForecastAccuracyPage() {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const { data: accuracy } = useQuery({
    queryKey: ['accuracy', '2026-01-01', '2026-01-31', 11, 0],
    queryFn: () => api.accuracy('2026-01-01', '2026-01-31', 11, 0),
  })

  const { data: timeseries } = useQuery({
    queryKey: ['timeseries', '2026-01-01', '2026-01-31', 11, 0],
    queryFn: () => api.timeseries('2026-01-01', '2026-01-31', 11, 0),
  })

  const points = timeseries?.points || []
  const matched = points.filter((p) => p.matched)

  const dailyData = matched.reduce((acc, p) => {
    const day = p.startTime.split('T')[0]
    if (!acc[day]) acc[day] = { day, errors: [], actuals: [], forecasts: [] }
    if (p.matched) {
      acc[day].errors.push(p.errorMw!)
      acc[day].actuals.push(p.actualMw!)
      acc[day].forecasts.push(p.forecastMw!)
    }
    return acc
  }, {} as Record<string, { day: string; errors: number[]; actuals: number[]; forecasts: number[] }>)

  const dailyStats = Object.values(dailyData).map((d) => {
    const n = d.errors.length
    const mae = n ? d.errors.reduce((a, b) => a + Math.abs(b), 0) / n : 0
    const rmse = n ? Math.sqrt(d.errors.reduce((a, b) => a + b * b, 0) / n) : 0
    const bias = n ? d.errors.reduce((a, b) => a + b, 0) / n : 0
    return {
      day: d.day,
      n,
      mae,
      rmse,
      bias,
    }
  })

  const sortedDaily = [...dailyStats].sort((a, b) => {
    if (!sortConfig) return 0
    const aVal = a[sortConfig.key as keyof typeof a]
    const bVal = b[sortConfig.key as keyof typeof b]
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return sortConfig.direction === 'asc' ? 1 : -1
    if (bVal === null) return sortConfig.direction === 'asc' ? -1 : 1
    const comparison = aVal > bVal ? 1 : -1
    return sortConfig.direction === 'asc' ? comparison : -comparison
  })

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  return (
    <div className='space-y-6'>
      <FilterBar
        defaultFrom='2026-01-01'
        defaultTo='2026-01-31'
        onRun={() => {}}
      />

      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
          <BarChart2 className='w-5 h-5' />
          Forecast Accuracy Metrics
        </h2>
      </div>

      {accuracy && (
        <AccuracyPanel accuracy={accuracy} />
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ActualVsForecastChart points={timeseries?.points || []} />
        <ErrorAnalysisChart points={timeseries?.points || []} />
      </div>

      <div className='overflow-x-auto'>
        <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3'>Daily Performance</h3>
        <table className='w-full text-left text-sm border-collapse'>
          <thead>
            <tr className='border-b border-slate-200 dark:border-slate-800'>
              <th className='pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' onClick={() => handleSort('day')}>Date {sortConfig?.key === 'day' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}</th>
              <th className='pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' onClick={() => handleSort('n')}>Intervals {sortConfig?.key === 'n' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}</th>
              <th className='pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' onClick={() => handleSort('mae')}>MAE (MW) {sortConfig?.key === 'mae' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}</th>
              <th className='pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' onClick={() => handleSort('rmse')}>RMSE (MW) {sortConfig?.key === 'rmse' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}</th>
              <th className='pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' onClick={() => handleSort('bias')}>Bias (MW) {sortConfig?.key === 'bias' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedDaily.map((d) => (
              <tr key={d.day} className='border-b border-slate-100 dark:border-slate-800/50'>
                <td className='py-2 text-slate-900 dark:text-slate-100 font-mono'>{format(new Date(d.day), 'dd MMM yyyy')}</td>
                <td className='py-2 text-slate-900 dark:text-slate-100'>{d.n}</td>
                <td className='py-2 text-right text-slate-900 dark:text-slate-100'>{d.mae.toFixed(1)}</td>
                <td className='py-2 text-right text-slate-900 dark:text-slate-100'>{d.rmse.toFixed(1)}</td>
                <td className='py-2 text-right text-slate-900 dark:text-slate-100'>{d.bias >= 0 ? '+' : ''}{d.bias.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MethodologyPanel period='2026-01-01 to 2026-01-31' cutoff='11:00 UK (D-1)' coverage={100} matched={accuracy?.matchedIntervals || 0} total={accuracy?.matchedIntervals || 0} />
    </div>
  )
}
