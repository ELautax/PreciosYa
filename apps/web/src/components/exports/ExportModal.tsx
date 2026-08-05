import { useEffect, useRef, useState } from 'react'
import { X, Download, Share2, Eye, FileImage, AlertTriangle, CheckCircle2 } from 'lucide-react'

import {
  getExportErrorMessage,
  useExportPriceList,
  sharePngIfSupported,
} from '@/hooks/useExport'
import type { LocalDto } from '@/types/local'
import type { ProductDto } from '@/types/product'

import { PriceListTemplate } from './PriceListTemplate'

type ExportModalProps = {
  local: LocalDto
  products: ProductDto[]
  /** Total del filtro actual (puede coincidir con products.length). */
  matchedTotal?: number
  loading?: boolean
  filterActive?: boolean
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

export function ExportModal({
  local,
  products,
  matchedTotal,
  loading = false,
  filterActive = false,
  onClose,
}: ExportModalProps) {
  const exportTemplateRef = useRef<HTMLDivElement | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const exportMut = useExportPriceList(local.id)
  const total = matchedTotal ?? products.length

  async function generateAndUpload(sharedVia?: string): Promise<{
    blob: Blob
    fileName: string
  } | null> {
    if (!exportTemplateRef.current || products.length === 0) return null
    setMessage(null)
    try {
      const res = await exportMut.mutateAsync({
        target: exportTemplateRef.current,
        sharedVia,
      })
      setMessage({ text: 'Lista exportada y guardada correctamente.', type: 'success' })
      return { blob: res.blob, fileName: res.fileName }
    } catch (error) {
      setMessage({ text: getExportErrorMessage(error), type: 'error' })
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
      setMessage({
        text: 'Tu navegador no soporta compartir directamente. Se descargó el PNG.',
        type: 'success',
      })
    }
  }

  useEffect(() => {
    setMessage(null)
  }, [products])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 animate-fade-in backdrop-blur-sm">
      <div
        className="surface-card flex max-h-[min(92dvh,92vh)] w-full max-w-4xl flex-col overflow-hidden animate-slide-up shadow-2xl rounded-t-[2rem] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/40 sm:hidden" />

        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
              <FileImage size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-black leading-none tracking-tight text-text-main">
                Exportar lista
              </h2>
              <p className="mt-1.5 text-xs font-semibold text-text-subtle">
                PNG listo para WhatsApp o imprimir
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all hover:bg-border active:scale-90"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-6 pt-2 scrollbar-hide">
          <div className="flex items-start justify-between gap-4 px-1">
            <div>
              <p className="text-sm font-bold text-text-main">Vista previa</p>
              {loading ? (
                <p className="mt-1 text-xs font-medium text-text-subtle">
                  Cargando todos los productos del filtro…
                </p>
              ) : (
                <p className="mt-1 text-xs font-medium leading-relaxed text-text-subtle">
                  Se exportarán{' '}
                  <span className="font-bold text-text-main">
                    {products.length} de {total}
                  </span>{' '}
                  productos
                  {filterActive ? ' (según búsqueda o filtros activos)' : ' del catálogo'}.
                </p>
              )}
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-soft px-3 py-1.5 sm:flex">
              <Eye size={14} className="text-primary-600" />
              <span className="text-xs font-bold text-text-muted">Previsualización</span>
            </div>
          </div>

          {loading ? (
            <div className="skeleton h-64 w-full rounded-[2rem]" />
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-bold text-text-muted">
                No hay productos para exportar con el filtro actual.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-soft p-4 shadow-inner group sm:p-8">
              <div className="mx-auto max-w-full overflow-x-auto scrollbar-hide animate-scale-in">
                <div className="mx-auto min-w-[320px] overflow-hidden rounded-lg bg-white shadow-2xl">
                  <PriceListTemplate local={local} products={products} variant="preview" />
                </div>
              </div>
            </div>
          )}

          {message ? (
            <div
              className={`flex animate-scale-in items-start gap-3 rounded-2xl border p-4 ${
                message.type === 'success'
                  ? 'border-primary-100 bg-primary-50/50 text-primary-800'
                  : 'border-danger-100 bg-danger-50/50 text-danger-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              )}
              <p className="text-sm font-bold leading-tight">{message.text}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-border bg-surface px-6 py-6 pb-safe sm:flex-row sm:pb-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary h-12 w-full border-none bg-surface-soft text-xs font-bold shadow-none hover:bg-border/30 sm:w-32"
          >
            Cerrar
          </button>
          <div className="flex-1" />
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              disabled={exportMut.isPending || loading || products.length === 0}
              onClick={() => void handleDownload()}
              className="btn-secondary h-12 flex-1 gap-2 sm:px-6"
            >
              <Download size={18} strokeWidth={3} />
              <span className="text-xs font-bold">Descargar</span>
            </button>
            <button
              type="button"
              disabled={exportMut.isPending || loading || products.length === 0}
              onClick={() => void handleShare()}
              className="btn-primary h-12 flex-1 gap-2 shadow-xl shadow-primary-600/20 sm:px-8"
            >
              <Share2 size={18} strokeWidth={3} />
              <span className="text-xs font-bold">Compartir</span>
            </button>
          </div>
        </div>

        <div className="pointer-events-none fixed left-[-10000px] top-0 opacity-0" aria-hidden>
          <div ref={exportTemplateRef}>
            <PriceListTemplate local={local} products={products} variant="export" />
          </div>
        </div>
      </div>
    </div>
  )
}
