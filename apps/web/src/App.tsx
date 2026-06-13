import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ToastViewport } from '@/components/feedback/ToastViewport'
import { AppLayout } from '@/components/layout/AppLayout'
import { OfflineBanner } from '@/components/OfflineBanner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useOfflineOutboxDrain } from '@/hooks/useOfflineOutboxDrain'
import LoginPage from '@/pages/auth/LoginPage'

function OfflineOutboxDrainBootstrap() {
  useOfflineOutboxDrain()
  return null
}

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const SalesPage = lazy(() => import('@/pages/SalesPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const LocalsPage = lazy(() => import('@/pages/LocalsPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))

function ExternalRedirect({ to }: { to: string }) {
  // Redirige fuera de la SPA (la descarga del APK vive en la landing)
  window.location.replace(to)
  return null
}

function RootRedirect() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-wrap max-w-3xl space-y-4">
          <div className="skeleton h-12 w-44" />
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return <Navigate to={session ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <>
      <OfflineOutboxDrainBootstrap />
      <OfflineBanner />
      <ToastViewport />
      <Suspense
        fallback={
          <div className="page-shell">
            <div className="page-wrap max-w-3xl space-y-4">
              <div className="skeleton h-12 w-44" />
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="skeleton h-64 w-full rounded-xl" />
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/download" element={<ExternalRedirect to="https://preciosya-landing.vercel.app/#descargar" />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/locals" element={<LocalsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
