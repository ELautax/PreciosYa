import { useRef, useState } from 'react'

import { useExportPriceList, sharePngIfSupported } from '@/hooks/useExport'
import type { LocalDto } from '@/types/local'
import type { ProductDto } from '@/types/product'

import { PriceListTemplate } from './PriceListTemplate'

type ExportModalProps = {
  local: LocalDto
  products: ProductDto[]
  onClose: () => void
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function ExportModal({ local, products, onClose }: ExportModalProps) {
  const templateRef = useRef<HTMLDivElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const exportMut = useExportPriceList(local.id)

  async function generateAndUpload(sharedVia?: string): Promise<{
    blob: Blob
    fileName: string
  } | null> {
    if (!templateRef.current) return null
    setMessage(null)
    try {
      const res = await exportMut.mutateAsync({
        target: templateRef.current,
        sharedVia,
      })
      setMessage('Lista exportada y guardada correctamente.')
      return { blob: res.blob, fileName: res.fileName }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo exportar')
      return null
    }
  }

  async function handleDownload(): Promise<void> {
    const out = await generateAndUpload('download')
    if (!out) return
    downloadBlob(out.blob, out.fileName)
  }

  async function handleShare(): Promise<void> {
    const out = await generateAndUpload('share')
    if (!out) return

    const shared = await sharePngIfSupported(out.blob, out.fileName)
    if (!shared) {
      downloadBlob(out.blob, out.fileName)
      setMessage('Tu navegador no soporta compartir archivos. Se descargó el PNG.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-stone-200 bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-stone-900">Exportar lista de precios</h2>
        <p className="mt-1 text-sm text-stone-600">
          Se genera un PNG con los productos visibles del local seleccionado.
        </p>

        <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div ref={templateRef} className="mx-auto w-fit">
            <PriceListTemplate local={local} products={products} />
          </div>
        </div>

        {message ? (
          <div className="mt-3 rounded-lg border border-stone-200 bg-white p-2 text-sm text-stone-700">
            {message}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-800 hover:bg-stone-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={exportMut.isPending || products.length === 0}
            onClick={() => void handleDownload()}
            className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-60"
          >
            Descargar PNG
          </button>
          <button
            type="button"
            disabled={exportMut.isPending || products.length === 0}
            onClick={() => void handleShare()}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}
