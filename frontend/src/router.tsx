import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { OverviewPage } from "@/pages/OverviewPage"
import { ForecastExplorerPage } from "@/pages/ForecastExplorerPage"
import { ForecastAccuracyPage } from "@/pages/ForecastAccuracyPage"
import { DataQualityPage } from "@/pages/DataQualityPage"
import { MethodologyPage } from "@/pages/MethodologyPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "forecast-explorer", element: <ForecastExplorerPage /> },
      { path: "forecast-accuracy", element: <ForecastAccuracyPage /> },
      { path: "data-quality", element: <DataQualityPage /> },
      { path: "methodology", element: <MethodologyPage /> },
    ],
  },
])