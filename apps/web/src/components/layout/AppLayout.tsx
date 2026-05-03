import { type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAuth } from '@/contexts/AuthContext'

type NavItem = {
  to: string
  label: string
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Panel' },
  { to: '/products', label: 'Productos' },
  { to: '/categories', label: 'Categorías' },
  { to: '/locals', label: 'Locales' },
  { to: '/history', label: 'Historial' },
  { to: '/settings', label: 'Ajustes' },
]

function NavItemLink({ to, label }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm ${
          isActive
            ? 'bg-green-100 font-medium text-green-900'
            : 'text-stone-700 hover:bg-stone-100'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function MobileBottomNav({ children }: { children: ReactNode }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white p-2 md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">{children}</div>
    </nav>
  )
}

export function AppLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-stone-200 bg-white p-4 md:block">
        <h1 className="mb-4 text-xl font-semibold text-green-800">PreciosYa</h1>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItemLink key={item.to} to={item.to} label={item.label} />
          ))}
        </div>
      </aside>

      <div className="pb-16 md:pb-0 md:pl-56">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <p className="font-semibold text-stone-900">PreciosYa</p>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
              >
                Salir
              </button>
            </div>
          </div>
        </header>
        <Outlet />
      </div>

      <MobileBottomNav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-2 py-2 text-center text-xs ${
                isActive
                  ? 'bg-green-100 font-medium text-green-900'
                  : 'text-stone-600 hover:bg-stone-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </MobileBottomNav>
    </div>
  )
}
