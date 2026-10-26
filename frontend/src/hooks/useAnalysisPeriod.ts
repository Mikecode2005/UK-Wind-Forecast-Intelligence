import { useOutletContext } from "react-router-dom"
import type { AnalysisContext } from "@/components/layout/AppShell"

export function useAnalysisPeriod(): AnalysisContext {
  return useOutletContext<AnalysisContext>()
}
