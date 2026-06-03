import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-600 dark:bg-danger-900/20">
            <AlertTriangle size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg font-black text-text-main">Algo falló en esta pantalla</p>
            <p className="mt-2 max-w-md text-sm text-text-muted">
              Probá recargar la página. Si tocaste «Sincronizar IPC», la sync pudo haber terminado
              bien aunque la vista se haya roto.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary h-11 px-6"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} className="mr-2" />
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
