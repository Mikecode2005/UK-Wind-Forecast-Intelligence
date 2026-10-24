import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { KPICard } from "./KPICard"

describe("KPICard", () => {
  it("renders title, value and subtitle", () => {
    render(<KPICard title="MAE" value="2126.1 MW" subtitle="Average |error|" />)
    expect(screen.getByText("MAE")).toBeDefined()
    expect(screen.getByText("2126.1 MW")).toBeDefined()
    expect(screen.getByText("Average |error|")).toBeDefined()
  })
})
