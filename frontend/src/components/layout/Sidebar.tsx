import { NavLink } from "react-router-dom"
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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-200 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div
          className={`flex items-center justify-between h-16 px-4 border-b border-slate-100 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
                <svg
                  className="w-4.5 h-4.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-slate-900 text-sm">Wind Forecast</div>
                <div className="text-[11px] text-slate-500">Intelligence</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto" role="navigation" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    } ${collapsed ? "justify-center px-2" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? "text-brand-600" : "text-slate-400"
                        }`}
                        aria-hidden="true"
                      />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && <span className="sr-only">(current)</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-slate-100 ${collapsed ? "hidden" : ""}`}>
          <div className="space-y-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Data provider: Elexon</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              <span>API: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
