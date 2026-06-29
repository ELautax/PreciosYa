import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X } from 'lucide-react'

import {
  attachStreamToVideo,
  openCameraStream,
  startHtml5BarcodeScanner,
  startNativeBarcodeLoop,
  stopCameraStream,
  supportsNativeBarcodeDetector,
  type Html5ScannerSession,
} from '@/lib/barcodeScanEngine'

type BarcodeScannerProps = {
  open: boolean
  onClose: () => void
  onDetected: (code: string) => void
}

type ScanMode = 'native' | 'html5'

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>(() =>
    supportsNativeBarcodeDetector() ? 'native' : 'html5',
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stopLoopRef = useRef<(() => void) | null>(null)
  const html5SessionRef = useRef<Html5ScannerSession | null>(null)
  const onDetectedRef = useRef(onDetected)
  const onCloseRef = useRef(onClose)
  const detectedRef = useRef(false)
  const uid = useId().replace(/:/g, '')
  const html5RegionId = `preciosya-html5-region-${uid}`

  onDetectedRef.current = onDetected
  onCloseRef.current = onClose

  async function waitForVideoEl(): Promise<HTMLVideoElement | null> {
    for (let i = 0; i < 40; i += 1) {
      const el = videoRef.current
      if (el) return el
      await new Promise((r) => window.setTimeout(r, 50))
    }
    return videoRef.current
  }

  async function waitForHtml5Region(): Promise<HTMLElement | null> {
    for (let i = 0; i < 40; i += 1) {
      const el = document.getElementById(html5RegionId)
      if (el && el.offsetHeight > 0) return el
      await new Promise((r) => window.setTimeout(r, 50))
    }
    return document.getElementById(html5RegionId)
  }

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('barcode-scanner-open')

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.classList.remove('barcode-scanner-open')
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setError(null)
      setStarting(false)
      setScanMode(supportsNativeBarcodeDetector() ? 'native' : 'html5')
      detectedRef.current = false
      return
    }

    let disposed = false
    detectedRef.current = false
    setStarting(true)
    setError(null)

    const handleDetected = (code: string): void => {
      if (disposed || detectedRef.current) return
      detectedRef.current = true
      onDetectedRef.current(code)
      onCloseRef.current()
    }

    const cleanup = async (): Promise<void> => {
      stopLoopRef.current?.()
      stopLoopRef.current = null
      if (html5SessionRef.current) {
        await html5SessionRef.current.stop()
        html5SessionRef.current = null
      }
      stopCameraStream(streamRef.current)
      streamRef.current = null
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    const startNative = async (): Promise<boolean> => {
      if (!supportsNativeBarcodeDetector()) return false

      const video = await waitForVideoEl()
      if (!video) return false

      const stream = await openCameraStream()
      if (disposed) {
        stopCameraStream(stream)
        return true
      }

      streamRef.current = stream
      await attachStreamToVideo(video, stream)
      if (disposed) return true

      stopLoopRef.current = startNativeBarcodeLoop(video, handleDetected)
      return true
    }

    const startHtml5 = async (): Promise<void> => {
      setScanMode('html5')
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
      if (disposed) return

      const region = await waitForHtml5Region()
      if (disposed || !region) {
        throw new Error('No se pudo montar el visor de cámara')
      }

      html5SessionRef.current = await startHtml5BarcodeScanner(html5RegionId, handleDetected)
    }

    void (async () => {
      try {
        const usedNative = await startNative()
        if (disposed) return

        if (!usedNative) {
          await startHtml5()
        }

        if (!disposed) setStarting(false)
      } catch {
        if (disposed) return
        try {
          await cleanup()
          await startHtml5()
          if (!disposed) setStarting(false)
        } catch {
          if (!disposed) {
            setStarting(false)
            setError(
              'No se pudo acceder a la cámara. Revisá permisos del navegador e ingresá el código manualmente.',
            )
          }
        }
      }
    })()

    return () => {
      disposed = true
      void cleanup()
    }
  }, [open, html5RegionId])

  if (!open) return null

  const mode = scanMode

  return createPortal(
    <div
      className="barcode-scanner-overlay fixed inset-0 z-[2147483647] flex h-[100dvh] w-full flex-col bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Escanear código de barras"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/15 bg-black px-4 py-4 safe-area-inset-top">
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
          <div className="relative flex min-h-0 flex-1 flex-col">
            {mode === 'native' ? (
              <video
                ref={videoRef}
                className="barcode-scanner-video h-full w-full flex-1 object-cover"
                playsInline
                muted
                autoPlay
              />
            ) : (
              <div
                id={html5RegionId}
                className="barcode-scanner-region h-full min-h-[50dvh] w-full flex-1"
              />
            )}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-36 w-[min(88vw,360px)] rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>

            {starting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">Iniciando cámara…</p>
              </div>
            ) : null}
          </div>

          <p className="shrink-0 px-4 py-4 pb-safe text-center text-xs font-bold uppercase tracking-widest text-white/60">
            Centrá el código de barras en el recuadro
          </p>
        </>
      )}
    </div>,
    document.body,
  )
}
