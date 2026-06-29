import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

type BarcodeScannerProps = {
  open: boolean
  onClose: () => void
  onDetected: (code: string) => void
}

const SCANNER_REGION_ID = 'preciosya-barcode-scanner-mount'
const SCANNER_PORTAL_ID = 'scanner-portal'

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
]

const CAMERA_CANDIDATES: Array<string | MediaTrackConstraints> = [
  { facingMode: { exact: 'environment' } },
  { facingMode: 'environment' },
  { facingMode: 'user' },
]

function getScannerPortal(): HTMLElement {
  return document.getElementById(SCANNER_PORTAL_ID) ?? document.body
}

async function waitForLayout(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
  await new Promise((resolve) => window.setTimeout(resolve, 80))
}

async function waitForElement(id: string, attempts = 30): Promise<HTMLElement | null> {
  for (let i = 0; i < attempts; i += 1) {
    const el = document.getElementById(id)
    if (el && el.offsetHeight > 0) return el
    await new Promise((r) => window.setTimeout(r, 50))
  }
  return document.getElementById(id)
}

function tuneVideoPreview(regionId: string): void {
  const video = document.querySelector<HTMLVideoElement>(`#${regionId} video`)
  if (!video) return
  video.setAttribute('playsinline', 'true')
  video.setAttribute('webkit-playsinline', 'true')
  video.muted = true
  video.style.display = 'block'
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.objectFit = 'cover'
  void video.play().catch(() => undefined)
}

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onDetectedRef = useRef(onDetected)
  const onCloseRef = useRef(onClose)

  onDetectedRef.current = onDetected
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setError(null)
      setStarting(false)
      return
    }

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

    const scanConfig = {
      fps: 10,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const w = Math.floor(Math.min(viewfinderWidth * 0.88, 340))
        const h = Math.floor(Math.min(viewfinderHeight * 0.42, 180))
        return { width: w, height: h }
      },
    }

    const startWithCamera = async (scanner: Html5Qrcode): Promise<void> => {
      const onScan = (decoded: string) => {
        void (async () => {
          await stopScanner(scanner)
          scannerRef.current = null
          if (!disposed) {
            onDetectedRef.current(decoded)
            onCloseRef.current()
          }
        })()
      }

      let lastError: unknown = null
      for (const camera of CAMERA_CANDIDATES) {
        try {
          await scanner.start(camera, scanConfig, onScan, () => undefined)
          tuneVideoPreview(SCANNER_REGION_ID)
          return
        } catch (err) {
          lastError = err
          await stopScanner(scanner)
        }
      }

      throw lastError ?? new Error('No se pudo iniciar la cámara')
    }

    void (async () => {
      await waitForLayout()
      const region = await waitForElement(SCANNER_REGION_ID)
      if (disposed || !region) {
        if (!disposed) {
          setStarting(false)
          setError('No se pudo iniciar el visor de cámara. Reintentá o ingresá el código a mano.')
        }
        return
      }

      const scanner = new Html5Qrcode(SCANNER_REGION_ID, {
        formatsToSupport: BARCODE_FORMATS,
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      })
      scannerRef.current = scanner

      try {
        await startWithCamera(scanner)
        if (!disposed) setStarting(false)
      } catch {
        if (!disposed) {
          setStarting(false)
          setError(
            'No se pudo acceder a la cámara. Revisá permisos del navegador e ingresá el código manualmente.',
          )
        }
        scannerRef.current = null
        await stopScanner(scanner)
      }
    })()

    return () => {
      disposed = true
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner) void stopScanner(scanner)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex h-[100dvh] w-full flex-col bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Escanear código de barras"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black px-4 py-4 safe-area-inset-top">
        <div className="flex items-center gap-2">
          <Camera size={20} className="text-primary-400" />
          <span className="text-sm font-black uppercase tracking-widest">Escanear código</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white"
          aria-label="Cerrar escáner"
        >
          <X size={22} />
        </button>
      </div>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="max-w-sm text-center text-sm font-bold text-red-400">{error}</p>
          <button type="button" className="btn-secondary border-white/20 bg-white/10 text-white" onClick={onClose}>
            Cerrar
          </button>
        </div>
      ) : (
        <>
          <div className="relative min-h-[55dvh] flex-1">
            <div id={SCANNER_REGION_ID} className="barcode-scanner-region absolute inset-0 h-full w-full" />
            {starting ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-white/80">
                  Iniciando cámara…
                </p>
              </div>
            ) : null}
          </div>
          <p className="shrink-0 px-4 py-4 pb-safe text-center text-xs font-bold uppercase tracking-widest text-white/60">
            Apuntá al código de barras del producto
          </p>
        </>
      )}
    </div>,
    getScannerPortal(),
  )
}
