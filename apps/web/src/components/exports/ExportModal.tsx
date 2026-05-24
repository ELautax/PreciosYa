import { useRef, useState } from 'react'
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
  const exportTemplateRef = useRef<HTMLDivElement | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const exportMut = useExportPriceList(local.id)

  async function generateAndUpload(sharedVia?: string): Promise<{
    blob: Blob
    fileName: string
  } | null> {
    if (!exportTemplateRef.current) return null
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
      setMessage({ text: 'Tu navegador no soporta compartir directamente. Se descargó el PNG.', type: 'success' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
      <div
        className="surface-card flex flex-col max-h-[92vh] w-full max-w-4xl overflow-hidden animate-slide-up shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-5">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                <FileImage size={20} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col">
                <h2 className="text-lg font-black tracking-tight text-text-main leading-none">Exportar Catálogo</h2>
                <p className="mt-1.5 text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">Generador de PNG</p>
             </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all hover:bg-border active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="flex items-start justify-between gap-4 px-1">
             <div>
                <p className="text-sm font-bold text-text-main">Vista Previa del Diseño</p>
                <p className="mt-1 text-xs font-medium text-text-subtle leading-relaxed">
                   Se generará una imagen optimizada con los {products.length} productos visibles.
                </p>
             </div>
             <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-surface-soft px-3 py-1.5 border border-border shrink-0">
                <Eye size={14} className="text-primary-600" />
                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Previsualización</span>
             </div>
          </div>

          <div className="relative rounded-[2rem] border border-border bg-surface-soft p-4 sm:p-8 shadow-inner overflow-hidden group">
            <div className="mx-auto max-w-full overflow-x-auto scrollbar-hide animate-scale-in">
              <div className="min-w-[320px] shadow-2xl rounded-lg overflow-hidden bg-white mx-auto">
                 <PriceListTemplate local={local} products={products} variant="preview" />
              </div>
            </div>
            {/* Overlay hint */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-border text-text-main">
                  Diseño Optimizado
               </span>
            </div>
          </div>

          {message && (
            <div className={`rounded-2xl border p-4 animate-scale-in flex items-start gap-3 ${
              message.type === 'success' ? 'border-primary-100 bg-primary-50/50 text-primary-800' : 'border-danger-100 bg-danger-50/50 text-danger-800'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
              <p className="text-sm font-bold leading-tight">{message.text}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface px-6 py-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-32 h-12 text-xs font-black uppercase tracking-widest shadow-none border-none bg-surface-soft hover:bg-border/30"
          >
            Cerrar
          </button>
          <div className="flex-1" />
          <div className="flex w-full sm:w-auto gap-3">
            <button
              type="button"
              disabled={exportMut.isPending || products.length === 0}
              onClick={() => void handleDownload()}
              className="btn-secondary flex-1 sm:px-6 h-12 gap-2"
            >
              <Download size={18} strokeWidth={3} />
              <span className="text-xs font-black uppercase tracking-widest">Descargar</span>
            </button>
            <button
              type="button"
              disabled={exportMut.isPending || products.length === 0}
              onClick={() => void handleShare()}
              className="btn-primary flex-1 sm:px-8 h-12 gap-2 shadow-xl shadow-primary-600/20"
            >
              <Share2 size={18} strokeWidth={3} />
              <span className="text-xs font-black uppercase tracking-widest">Compartir</span>
            </button>
          </div>
        </div>

        {/* Hidden template for capture */}
        <div
          className="pointer-events-none fixed left-[-10000px] top-0 opacity-0"
          aria-hidden
        >
          <div ref={exportTemplateRef}>
            <PriceListTemplate local={local} products={products} variant="export" />
          </div>
        </div>
      </div>
    </div>
  )
}
