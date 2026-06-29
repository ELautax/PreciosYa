import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
]

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>
}

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike

const DETECTOR_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'itf',
]

function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  const ctor = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
  return ctor ?? null
}

export async function openCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { exact: 'environment' } }, audio: false },
    { video: { facingMode: 'environment' }, audio: false },
    { video: { facingMode: 'user' }, audio: false },
    { video: true, audio: false },
  ]

  let lastError: unknown = null
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se pudo acceder a la cámara')
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return
  for (const track of stream.getTracks()) {
    track.stop()
  }
}

export async function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  video.srcObject = stream
  video.setAttribute('playsinline', 'true')
  video.setAttribute('webkit-playsinline', 'true')
  video.muted = true
  video.autoplay = true
  await video.play()
}

export function startNativeBarcodeLoop(
  video: HTMLVideoElement,
  onDetected: (code: string) => void,
): () => void {
  const Detector = getBarcodeDetectorCtor()
  if (!Detector) {
    return () => undefined
  }

  const detector = new Detector({ formats: DETECTOR_FORMATS })
  let active = true
  let busy = false

  const tick = (): void => {
    if (!active || busy || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (active) window.requestAnimationFrame(tick)
      return
    }

    busy = true
    void detector
      .detect(video)
      .then((results) => {
        const code = results.find((r) => r.rawValue)?.rawValue
        if (code && active) {
          active = false
          onDetected(code)
          return
        }
        busy = false
        if (active) window.requestAnimationFrame(tick)
      })
      .catch(() => {
        busy = false
        if (active) window.requestAnimationFrame(tick)
      })
  }

  window.requestAnimationFrame(tick)
  return () => {
    active = false
  }
}

export type Html5ScannerSession = {
  stop: () => Promise<void>
}

export async function startHtml5BarcodeScanner(
  elementId: string,
  onDetected: (code: string) => void,
): Promise<Html5ScannerSession> {
  const scanner = new Html5Qrcode(elementId, {
    formatsToSupport: BARCODE_FORMATS,
    useBarCodeDetectorIfSupported: true,
    verbose: false,
  })

  const cameras = await Html5Qrcode.getCameras().catch(() => [] as Array<{ id: string; label: string }>)
  const backCamera = cameras.find((c) => /back|rear|environment|trás|trasera/i.test(c.label))
  const cameraId = backCamera?.id ?? cameras.at(-1)?.id

  const config = {
    fps: 12,
    qrbox: (w: number, h: number) => ({
      width: Math.floor(Math.min(w * 0.9, 360)),
      height: Math.floor(Math.min(h * 0.45, 200)),
    }),
  }

  const onScan = (decoded: string) => {
    void scanner.stop().then(() => scanner.clear()).catch(() => undefined)
    onDetected(decoded)
  }

  if (cameraId) {
    await scanner.start(cameraId, config, onScan, () => undefined)
  } else {
    await scanner.start({ facingMode: 'environment' }, config, onScan, () => undefined)
  }

  return {
    stop: async () => {
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
    },
  }
}

export function supportsNativeBarcodeDetector(): boolean {
  return getBarcodeDetectorCtor() !== null
}
