import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { OverviewPage } from "@/pages/OverviewPage"
import { ForecastExplorerPage } from "@/pages/ForecastExplorerPage"
import { ForecastAccuracyPage } from "@/pages/ForecastAccuracyPage"
import { DataQualityPage } from "@/pages/DataQualityPage"
import { MethodologyPage } from "@/pages/MethodologyPage"

function RouteError() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 max-w-md mb-4">
        An unexpected error occurred while rendering this page. Try returning to Overview or
        resetting the analysis period to January 2026.
      </p>
      <a href="/" className="btn-primary">
        Back to Overview
      </a>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "forecast-explorer", element: <ForecastExplorerPage /> },
      { path: "forecast-accuracy", element: <ForecastAccuracyPage /> },
      { path: "data-quality", element: <DataQualityPage /> },
      { path: "methodology", element: <MethodologyPage /> },
    ],
  },
])
