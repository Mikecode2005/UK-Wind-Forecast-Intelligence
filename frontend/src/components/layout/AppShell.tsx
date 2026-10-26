import { Outlet } from "react-router-dom"
import { useCallback, useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export type AnalysisContext = {
  from: string
  to: string
  cutoffHour: number
  setPeriod: (from: string, to: string) => void
  setCutoffHour: (h: number) => void
  lastRefresh: Date | null
  setLastRefresh: (d: Date | null) => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
  refreshKey: number
  triggerRefresh: () => void
}

export function AppShell() {
  const [from, setFrom] = useState("2026-01-01")
  const [to, setTo] = useState("2026-01-31")
  const [cutoffHour, setCutoffHour] = useState(11)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const setPeriod = useCallback((f: string, t: string) => {
    if (f && t && f <= t) {
      setFrom(f)
      setTo(t)
    }
  }, [])

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setLastRefresh(new Date())
  }, [])

  const ctx: AnalysisContext = {
    from,
    to,
    cutoffHour,
    setPeriod,
    setCutoffHour,
    lastRefresh,
    setLastRefresh,
    isLoading,
    setIsLoading,
    refreshKey,
    triggerRefresh,
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <Header
          onRefresh={triggerRefresh}
          isLoading={isLoading}
          lastRefresh={lastRefresh}
          analysisFrom={from}
          analysisTo={to}
          onDateChange={setPeriod}
        />
        <main className="flex-1 p-6 overflow-auto bg-slate-50">
          <Outlet context={ctx} />
        </main>
      </div>
    </div>
  )
}
