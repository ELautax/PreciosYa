export type ToastTone = 'success' | 'error' | 'info'

export type ToastInput = {
  message: string
  tone?: ToastTone
}

export type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

type ToastListener = (toast: ToastItem) => void

let toastSeq = 0
const listeners = new Set<ToastListener>()

function emitToast(input: ToastInput): void {
  const toast: ToastItem = {
    id: ++toastSeq,
    message: input.message,
    tone: input.tone ?? 'info',
  }
  listeners.forEach((listener) => listener(toast))
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const appToast = {
  success(message: string): void {
    emitToast({ message, tone: 'success' })
  },
  error(message: string): void {
    emitToast({ message, tone: 'error' })
  },
  info(message: string): void {
    emitToast({ message, tone: 'info' })
  },
}

