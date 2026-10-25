import { Outlet } from "react-router-dom"
import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function AppShell() {
  const [analysisFrom, setAnalysisFrom] = useState("2026-01-01")
  const [analysisTo, setAnalysisTo] = useState("2026-01-31")

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <Header
          onRefresh={() => {}}
          isLoading={false}
          lastRefresh={null}
          analysisFrom={analysisFrom}
          analysisTo={analysisTo}
          onDateChange={(from, to) => {
            setAnalysisFrom(from)
            setAnalysisTo(to)
          }}
        />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
