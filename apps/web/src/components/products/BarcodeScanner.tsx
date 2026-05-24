import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

type BarcodeScannerProps = {
  open: boolean
  onClose: () => void
  onDetected: (code: string) => void
}

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const regionId = 'preciosya-barcode-region'

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const scanner = new Html5Qrcode(regionId)
    scannerRef.current = scanner

    void (async () => {
      try {
        setError(null)
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 120 } },
          (decoded) => {
            onDetected(decoded)
            void scanner.stop().then(() => {
              scannerRef.current = null
              onClose()
            })
          },
          () => undefined,
        )
      } catch {
        if (!cancelled) {
          setError('No se pudo acceder a la cámara. Ingresá el código manualmente.')
        }
      }
    })()

    return () => {
      cancelled = true
      void scanner.stop().catch(() => undefined)
      scannerRef.current = null
    }
  }, [open, onClose, onDetected])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 safe-area-inset-top">
        <div className="flex items-center gap-2 text-white">
          <Camera size={20} />
          <span className="text-sm font-black uppercase tracking-widest">Escanear código</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white"
          aria-label="Cerrar escáner"
        >
          <X size={22} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        {error ? (
          <p className="max-w-sm text-center text-sm font-bold text-danger-100">{error}</p>
        ) : (
          <>
            <div
              id={regionId}
              className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-primary-500/50"
            />
            <p className="text-center text-xs font-bold uppercase tracking-widest text-white/70">
              Apuntá al código de barras del producto
            </p>
          </>
        )}
      </div>
    </div>
  )
}
