import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { useState } from "react"

export function AppShell() {
  const [analysisFrom, setAnalysisFrom] = useState("2026-01-01")
  const analysisTo = "2026-01-31"
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
        onDateChange={setAnalysisFrom}
      />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}