import { type ReactNode, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { InstallPromptButton } from '@/components/pwa/InstallPromptButton'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
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
  const { theme, toggleTheme } = useTheme()
  const { data: me } = useMe()
  const navItems: NavItem[] = me?.isAdmin
    ? [...baseNavItems, { to: '/admin', label: 'Admin' }]
    : baseNavItems
  const [wcoActive, setWcoActive] = useState(false)

  useEffect(() => {
    const nav = navigator as Navigator & {
      windowControlsOverlay?: {
        visible: boolean
        addEventListener?: (type: 'geometrychange', cb: () => void) => void
        removeEventListener?: (type: 'geometrychange', cb: () => void) => void
      }
    }
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const recalc = () => {
      const standalone = standaloneQuery.matches
      const hasWco = Boolean(nav.windowControlsOverlay?.visible)
      setWcoActive(standalone && hasWco)
    }
    recalc()
    standaloneQuery.addEventListener('change', recalc)
    nav.windowControlsOverlay?.addEventListener?.('geometrychange', recalc)
    return () => {
      standaloneQuery.removeEventListener('change', recalc)
      nav.windowControlsOverlay?.removeEventListener?.('geometrychange', recalc)
    }
  }, [])

  return (
    <div className="app-shell min-h-screen text-stone-900">
      <div className="md:grid md:min-h-screen md:grid-cols-[250px_1fr]">
        <aside className="app-sidebar hidden border-r border-stone-200 bg-white/90 p-5 md:block">
          <div className="mb-6 flex items-center gap-2">
            <img
              src={preciosYaLogo}
              alt="Logo de PreciosYa"
              className="h-9 w-9 rounded-md object-contain"
            />
            <div>
              <p className="font-extrabold text-stone-900">
                Precios<span className="text-amber-700">Ya</span>
              </p>
              <p className="text-sm text-stone-500">Gestión confiable diaria</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-green-100 font-medium text-green-900'
                      : 'text-stone-700 hover:bg-stone-100/80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="pb-16 md:pb-0">
          <header className={`app-topbar sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur ${wcoActive ? 'wco-active' : ''}`}>
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              {wcoActive ? <div className="wco-drag-region" aria-hidden /> : null}
              <div className="flex items-center gap-2 wco-no-drag">
                <img
                  src={preciosYaLogo}
                  alt="Logo de PreciosYa"
                  className="h-8 w-8 rounded-md object-contain md:hidden"
                />
                <p className="font-extrabold text-stone-900">
                  Precios<span className="text-amber-700">Ya</span>
                </p>
                {me?.isAdmin ? (
                  <span className="rounded bg-amber-100 px-2 py-1 text-sm font-medium text-amber-800">
                    Admin
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 wco-no-drag">
                <InstallPromptButton />
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn-soft"
                >
                  {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                </button>
                <NotificationCenter />
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="btn-soft"
                >
                  Salir
                </button>
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </div>

      <MobileBottomNav columns={navItems.length}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-11 items-center justify-center rounded-lg px-2 py-2 text-center text-sm ${
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
