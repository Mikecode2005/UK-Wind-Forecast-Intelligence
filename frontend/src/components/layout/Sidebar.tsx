import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Search,
  BarChart3,
  FileText,
  BookOpen,
  Database,
  Wifi,
  Info,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/forecast-explorer", label: "Forecast Explorer", icon: Search },
  { path: "/forecast-accuracy", label: "Forecast Accuracy", icon: BarChart3 },
  { path: "/data-quality", label: "Data Quality", icon: FileText },
  { path: "/methodology", label: "Methodology", icon: BookOpen },
] as const

export function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 z-40 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-100 dark:text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Wind Forecast Intelligence</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 overflow-y-auto" role="navigation" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={`p-4 border-t border-slate-200 dark:border-slate-800 ${collapsed ? "hidden" : ""}`}>
          <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" aria-hidden="true" />
              <span>Data provider: Elexon</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-500" aria-hidden="true" />
              <span>API: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" aria-hidden="true" />
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}