import { Factory, GitMerge, Package, PackageOpen, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  to: string
  label: string
  icon: LucideIcon
}

const navigationItems: NavigationItem[] = [
  { to: '/products', label: 'Products', icon: Package },
  { to: '/raw-materials', label: 'Raw Materials', icon: PackageOpen },
  { to: '/composition', label: 'Composition', icon: GitMerge },
  { to: '/production', label: 'Production', icon: Factory },
]

function SidebarNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="mt-6 space-y-2">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')
          }
        >
          <item.icon size={16} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Industrial System
        </p>
        <p className="mt-2 text-xl font-semibold text-slate-900">Inventory Hub</p>
      </div>

      <SidebarNavigation onNavigate={onNavigate} />

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Alex Johnson</p>
        <p className="text-xs text-slate-500">System Admin</p>
      </div>
    </>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-6 md:flex">
        <SidebarContent onNavigate={() => undefined} />
      </aside>

      <div
        className={[
          'fixed inset-0 z-40 md:hidden',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close navigation drawer"
          onClick={onClose}
          className={[
            'absolute inset-0 bg-slate-950/30 transition-opacity',
            isOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={[
            'relative flex h-full w-72 flex-col border-r border-slate-200 bg-white p-6 shadow-xl transition-transform duration-200',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={onClose}
            className="mb-4 self-end rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Close sidebar"
          >
            <X size={18} aria-hidden="true" />
          </button>

          <SidebarContent onNavigate={onClose} />
        </aside>
      </div>
    </>
  )
}
