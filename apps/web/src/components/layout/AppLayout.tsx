import { type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAuth } from '@/contexts/AuthContext'
import { useMe } from '@/hooks/useMe'
import preciosYaLogo from '@/assets/preciosya-logo.png'

type NavItem = {
  to: string
  label: string
}

const baseNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Panel' },
  { to: '/products', label: 'Productos' },
  { to: '/categories', label: 'Categorías' },
  { to: '/locals', label: 'Locales' },
  { to: '/history', label: 'Historial' },
  { to: '/settings', label: 'Ajustes' },
]

function MobileBottomNav({
  children,
  columns,
}: {
  children: ReactNode
  columns: number
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white p-2 md:hidden">
      <div
        className="mx-auto grid max-w-xl gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </nav>
  )
}

export function AppLayout() {
  const { signOut } = useAuth()
  const { data: me } = useMe()
  const navItems: NavItem[] = me?.isAdmin
    ? [...baseNavItems, { to: '/admin', label: 'Admin' }]
    : baseNavItems

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="pb-16 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <img
                src={preciosYaLogo}
                alt="Logo de PreciosYa"
                className="h-8 w-8 rounded-md object-contain"
              />
              <p className="font-semibold text-stone-900">PreciosYa</p>
            </div>
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
          <div className="mx-auto hidden max-w-6xl items-center gap-2 px-4 pb-3 sm:px-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-green-100 font-medium text-green-900'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>
        <Outlet />
      </div>

      <MobileBottomNav columns={navItems.length}>
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
