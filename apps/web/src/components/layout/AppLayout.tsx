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
  Moon
} from 'lucide-react'

import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { InstallPromptButton } from '@/components/pwa/InstallPromptButton'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useMe } from '@/hooks/useMe'
import preciosYaLogo from '@/assets/preciosya-logo.png'

type NavItem = {
  to: string
  label: string
  icon: any
}

const baseNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/locals', label: 'Locales', icon: Store },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

export function AppLayout() {
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: me, isLoading: loadingMe } = useMe()
  const location = useLocation()
  
  const [wcoActive, setWcoActive] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const navItems: NavItem[] = me?.isAdmin
    ? [...baseNavItems, { to: '/admin', label: 'Admin', icon: ShieldCheck }]
    : baseNavItems

  const mobileNavItems = navItems.slice(0, 4)
  const moreNavItems = navItems.slice(4)

  useEffect(() => {
    setIsMoreMenuOpen(false)
  }, [location.pathname])

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
    <div className="flex min-h-screen bg-canvas text-text-main transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-surface md:flex">
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/20">
              <img 
                src={preciosYaLogo} 
                alt="Logo" 
                className="h-7 w-7 object-contain brightness-0 invert" 
              />
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-black tracking-tighter leading-none">
                Precios<span className="text-primary-600">Ya</span>
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-text-subtle leading-none">
                Gestión Inteligente
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1" aria-label="Navegación principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
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
                <span className="truncate">{item.label}</span>
                {item.to === '/admin' && (
                   <span className="ml-auto rounded-full bg-accent-500 px-1.5 py-0.5 text-[8px] font-black text-white">
                      PRO
                   </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <button
              onClick={() => void signOut()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-danger-600 transition-all hover:bg-danger-50 dark:hover:bg-danger-900/10"
            >
              <LogOut size={20} strokeWidth={2.5} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <header 
          className={`sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md safe-area-inset-top transition-all ${wcoActive ? 'wco-active' : ''}`}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            {wcoActive && <div className="wco-drag-region" aria-hidden />}
            
            <div className="flex items-center gap-2 md:hidden">
              <img src={preciosYaLogo} alt="Logo" className="h-8 w-8" />
              <p className="text-xl font-black tracking-tighter text-text-main">
                Precios<span className="text-primary-600">Ya</span>
              </p>
            </div>

            <div className="hidden items-center gap-2 md:flex">
               {/* Contextual Title based on route can go here */}
            </div>

            <div className="flex items-center gap-3 wco-no-drag">
              <div className="hidden sm:block">
                <InstallPromptButton />
              </div>
              <NotificationCenter />
              <button
                onClick={toggleTheme}
                className="btn-secondary h-11 w-11 p-0 rounded-full border-none bg-transparent shadow-none hover:bg-surface-soft active:scale-90"
                aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              >
                <div className="transition-transform duration-300">
                   {theme === 'light' ? <Moon size={22} className="text-text-muted" /> : <Sun size={22} className="text-accent-500" />}
                </div>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="hidden flex-col items-end text-right sm:flex">
                   {loadingMe ? (
                     <div className="skeleton h-3 w-20" />
                   ) : (
                     <p className="text-xs font-black text-text-main leading-none">{me?.name}</p>
                   )}
                   <p className="text-[10px] font-bold text-text-subtle leading-none mt-1 uppercase tracking-tighter">
                     {me?.isAdmin ? 'ADMINISTRADOR' : 'COMERCIANTE'}
                   </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-black text-primary-700 shadow-sm transition-transform active:scale-95 dark:bg-primary-900/20 dark:border-primary-800">
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
              {location.pathname === item.to && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary-600" />
              )}
            </NavLink>
          ))}
          <button
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

      {/* Mobile "More" Menu Overlay */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-black/40 animate-fade-in md:hidden" 
          onClick={() => setIsMoreMenuOpen(false)}
          role="presentation"
        >
          <div 
            className="absolute bottom-0 w-full animate-slide-up rounded-t-[2.5rem] bg-surface p-8 pb-12 shadow-2xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border-strong/50" />
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight text-text-main">Menú Principal</h2>
              <button 
                onClick={() => setIsMoreMenuOpen(false)} 
                className="rounded-full bg-surface-soft p-3 text-text-subtle transition-transform active:scale-90"
                aria-label="Cerrar menú"
              >
                <X size={22} strokeWidth={3} />
              </button>
            </div>
            
            <div className="mb-6 sm:hidden">
              <InstallPromptButton />
            </div>

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
              <button
                onClick={() => void signOut()}
                className="mt-4 flex items-center justify-between rounded-2xl border border-danger-100 bg-danger-50 p-4 text-danger-600 transition-all active:scale-[0.98] dark:border-danger-900/20 dark:bg-danger-900/10"
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
      )}
    </div>
  )
}
