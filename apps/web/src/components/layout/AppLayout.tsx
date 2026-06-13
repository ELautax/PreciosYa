import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  Store,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  ChevronRight,
  MoreHorizontal,
  Sun,
  Moon,
  Receipt,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { InstallPromptButton } from '@/components/pwa/InstallPromptButton'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useMe } from '@/hooks/useMe'
import preciosYaLogo from '@/assets/preciosya-logo.png'

const SIDEBAR_STORAGE_KEY = 'preciosya-sidebar-collapsed'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const baseNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/sales', label: 'Ventas', icon: Receipt },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/locals', label: 'Locales', icon: Store },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function AppLayout() {
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: me, isLoading: loadingMe } = useMe()
  const location = useLocation()

  const [wcoActive, setWcoActive] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  const navItems: NavItem[] = me?.isAdmin
    ? [...baseNavItems, { to: '/admin', label: 'Admin', icon: ShieldCheck }]
    : baseNavItems

  const mobileNavItems = navItems.slice(0, 4)
  const moreNavItems = navItems.slice(4)

  useEffect(() => {
    setIsMoreMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
    } catch {
      /* ignore quota / private mode */
    }
  }, [sidebarCollapsed])

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

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev)
  }

  const sidebarWidthClass = sidebarCollapsed ? 'md:ml-[4.5rem]' : 'md:ml-64'

  return (
    <div className="flex min-h-screen bg-canvas text-text-main transition-colors duration-300">
      {/* Desktop Sidebar — fijo a viewport; nav scrollea; logout siempre abajo */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface transition-[width] duration-300 md:flex ${
          sidebarCollapsed ? 'w-[4.5rem]' : 'w-64'
        }`}
        aria-label="Menú lateral"
      >
        <div className="flex h-full min-h-0 flex-col p-3">
          <div
            className={`mb-4 flex shrink-0 items-center gap-3 ${
              sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-2 py-2'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/20">
              <img
                src={preciosYaLogo}
                alt="Logo PreciosYa"
                className="h-7 w-7 object-contain brightness-0 invert"
              />
            </div>
            {!sidebarCollapsed ? (
              <div className="min-w-0 flex flex-col">
                <p className="truncate text-xl font-black leading-none tracking-tighter">
                  Precios<span className="text-primary-600">Ya</span>
                </p>
                <p className="mt-1 truncate text-[10px] font-extrabold uppercase leading-none tracking-widest text-text-subtle">
                  Gestión Inteligente
                </p>
              </div>
            ) : null}
          </div>

          <nav
            className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-1 py-1 scrollbar-hide"
            aria-label="Navegación principal"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl py-3 text-sm font-bold transition-all ${
                    sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                  } ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'text-text-muted hover:bg-surface-soft hover:text-text-main'
                  }`
                }
              >
                <item.icon
                  size={20}
                  strokeWidth={location.pathname === item.to ? 2.5 : 2}
                  className="shrink-0"
                />
                {!sidebarCollapsed ? (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.to === '/admin' ? (
                      <span className="ml-auto rounded-full bg-accent-500 px-1.5 py-0.5 text-[8px] font-black text-white">
                        PRO
                      </span>
                    ) : null}
                  </>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto shrink-0 space-y-1 border-t border-border pt-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-bold text-text-muted transition-all hover:bg-surface-soft hover:text-text-main ${
                sidebarCollapsed ? 'justify-center px-2' : 'gap-3'
              }`}
              aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={20} strokeWidth={2.5} />
              ) : (
                <>
                  <PanelLeftClose size={20} strokeWidth={2.5} />
                  <span className="truncate">Contraer menú</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
              className={`flex w-full items-center rounded-xl py-3 text-sm font-bold text-danger-600 transition-all hover:bg-danger-50 dark:hover:bg-danger-900/10 ${
                sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
              }`}
            >
              <LogOut size={20} strokeWidth={2.5} />
              {!sidebarCollapsed ? <span className="truncate">Cerrar Sesión</span> : null}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${sidebarWidthClass}`}
      >
        <header
          className={`sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md safe-area-inset-top transition-all ${wcoActive ? 'wco-active' : ''}`}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            {wcoActive ? <div className="wco-drag-region" aria-hidden /> : null}

            <div className="flex items-center gap-2 md:hidden">
              <img src={preciosYaLogo} alt="Logo" className="h-8 w-8" />
              <p className="text-xl font-black tracking-tighter text-text-main">
                Precios<span className="text-primary-600">Ya</span>
              </p>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={toggleSidebar}
                className="btn-secondary h-11 w-11 rounded-full border-none bg-transparent p-0 shadow-none hover:bg-surface-soft active:scale-90"
                aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={22} className="text-text-muted" />
                ) : (
                  <PanelLeftClose size={22} className="text-text-muted" />
                )}
              </button>
            </div>

            <div className="flex wco-no-drag items-center gap-3">
              <div className="hidden sm:block">
                <InstallPromptButton />
              </div>
              <NotificationCenter />
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-secondary h-11 w-11 rounded-full border-none bg-transparent p-0 shadow-none hover:bg-surface-soft active:scale-90"
                aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              >
                <div className="transition-transform duration-300">
                  {theme === 'light' ? (
                    <Moon size={22} className="text-text-muted" />
                  ) : (
                    <Sun size={22} className="text-accent-500" />
                  )}
                </div>
              </button>

              <div className="flex items-center gap-2">
                <div className="hidden flex-col items-end text-right sm:flex">
                  {loadingMe ? (
                    <div className="skeleton h-3 w-20" />
                  ) : (
                    <p className="text-xs font-black leading-none text-text-main">{me?.name}</p>
                  )}
                  <p className="mt-1 text-[10px] font-bold uppercase leading-none tracking-tighter text-text-subtle">
                    {me?.isAdmin ? 'ADMINISTRADOR' : 'COMERCIANTE'}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-100 bg-primary-50 font-black text-primary-700 shadow-sm transition-transform active:scale-95 dark:border-primary-800 dark:bg-primary-900/20">
                  {me?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/90 pb-safe backdrop-blur-xl transition-transform duration-300 md:hidden ${isMoreMenuOpen ? 'translate-y-full' : 'translate-y-0'}`}
        aria-label="Navegación móvil"
      >
        <div className="grid h-16 grid-cols-5">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? 'text-primary-600' : 'text-text-subtle'
                }`
              }
            >
              <item.icon
                size={22}
                strokeWidth={location.pathname === item.to ? 2.5 : 2}
                className={`transition-transform ${location.pathname === item.to ? 'scale-110' : ''}`}
              />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {location.pathname === item.to ? (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary-600" />
              ) : null}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isMoreMenuOpen ? 'text-primary-600' : 'text-text-subtle'
            }`}
            aria-expanded={isMoreMenuOpen}
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest">Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Menu — ítems scrolleables; cerrar sesión fijo abajo */}
      {isMoreMenuOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-black/40 animate-fade-in md:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
          role="presentation"
        >
          <div
            className="absolute bottom-0 flex max-h-[min(85dvh,640px)] w-full flex-col rounded-t-[2.5rem] bg-surface shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
          >
            <div className="shrink-0 px-8 pt-4">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border-strong/50" />
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight text-text-main">Menú Principal</h2>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="rounded-full bg-surface-soft p-3 text-text-subtle transition-transform active:scale-90"
                  aria-label="Cerrar menú"
                >
                  <X size={22} strokeWidth={3} />
                </button>
              </div>
              <div className="mb-4 sm:hidden">
                <InstallPromptButton />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-4 scrollbar-hide">
              <div className="grid gap-3">
                {moreNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between rounded-2xl border border-border bg-surface-soft p-4 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-surface p-2.5 text-primary-600 shadow-warm-sm dark:bg-canvas">
                        <item.icon size={24} strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-text-main">{item.label}</span>
                    </div>
                    <ChevronRight size={20} className="text-text-subtle" />
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-8 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex w-full items-center justify-between rounded-2xl border border-danger-100 bg-danger-50 p-4 text-danger-600 transition-all active:scale-[0.98] dark:border-danger-900/20 dark:bg-danger-900/10"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-2.5 shadow-sm dark:bg-canvas">
                    <LogOut size={24} strokeWidth={2.5} />
                  </div>
                  <span className="font-extrabold">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
