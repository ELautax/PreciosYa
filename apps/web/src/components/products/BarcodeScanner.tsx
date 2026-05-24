import { useEffect, useId, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

type BarcodeScannerProps = {
  open: boolean
  onClose: () => void
  onDetected: (code: string) => void
}

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onDetectedRef = useRef(onDetected)
  const onCloseRef = useRef(onClose)
  const uid = useId().replace(/:/g, '')
  const regionId = `preciosya-barcode-region-${uid}`

  onDetectedRef.current = onDetected
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    let disposed = false
    setStarting(true)
    setError(null)

    const stopScanner = async (scanner: Html5Qrcode): Promise<void> => {
      try {
        await scanner.stop()
      } catch {
        /* ya detenido */
      }
      try {
        scanner.clear()
      } catch {
        /* sin preview */
      }
    }

    void (async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      if (disposed) return

      const scanner = new Html5Qrcode(regionId)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            aspectRatio: 1.777778,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const w = Math.floor(Math.min(viewfinderWidth * 0.9, 300))
              const h = Math.floor(Math.min(viewfinderHeight * 0.45, 140))
              return { width: w, height: h }
            },
          },
          (decoded) => {
            void (async () => {
              await stopScanner(scanner)
              scannerRef.current = null
              if (!disposed) {
                onDetectedRef.current(decoded)
                onCloseRef.current()
              }
            })()
          },
          () => undefined,
        )
        if (!disposed) setStarting(false)
      } catch {
        if (!disposed) {
          setStarting(false)
          setError('No se pudo acceder a la cámara. Ingresá el código manualmente.')
        }
        scannerRef.current = null
      }
    })()

    return () => {
      disposed = true
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner) void stopScanner(scanner)
    }
  }, [open, regionId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-canvas animate-fade-in">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-4 safe-area-inset-top">
        <div className="flex items-center gap-2 text-text-main">
          <Camera size={20} className="text-primary-600" />
          <span className="text-sm font-black uppercase tracking-widest">Escanear código</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-surface-soft p-2 text-text-muted hover:text-text-main"
          aria-label="Cerrar escáner"
        >
          <X size={22} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        {error ? (
          <p className="max-w-sm text-center text-sm font-bold text-danger-600">{error}</p>
        ) : (
          <>
            <div
              id={regionId}
              className="barcode-scanner-region w-full max-w-md min-h-[280px] overflow-hidden rounded-2xl border-2 border-primary-600/40 bg-black"
            />
            {starting && (
              <p className="text-center text-xs font-bold uppercase tracking-widest text-text-subtle">
                Iniciando cámara…
              </p>
            )}
            <p className="text-center text-xs font-bold uppercase tracking-widest text-text-subtle">
              Apuntá al código de barras del producto
            </p>
          </>
        )}
      </div>
    </div>
  )
}
