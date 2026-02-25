import { Bell, Menu, Settings } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
}

const pageLabels: Record<string, string> = {
  '/products': 'Products',
  '/raw-materials': 'Raw Materials',
  '/composition': 'Composition',
  '/production': 'Production',
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const pageLabel = pageLabels[location.pathname] ?? 'Workspace'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
          >
            <Menu size={18} aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm text-slate-500">Inventory Management</p>
            <p className="truncate text-lg font-semibold text-slate-900">{pageLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Notifications"
          >
            <Bell size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Settings"
          >
            <Settings size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
