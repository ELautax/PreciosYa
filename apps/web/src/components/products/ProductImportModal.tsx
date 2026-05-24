import { useRef, useState } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle2, Download, Info } from 'lucide-react'

import type { CsvImportResult } from '@/hooks/useProducts'

type ProductImportModalProps = {
  isImporting: boolean
  lastResult: CsvImportResult | null
  onDismissResult: () => void
  onImport: (csv: string) => void
  onClose: () => void
}

export function ProductImportModal({
  isImporting,
  lastResult,
  onDismissResult,
  onImport,
  onClose,
}: ProductImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileHint, setFileHint] = useState<string | null>(null)

  function readFile(f: File): void {
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      if (!text.trim()) {
        setFileHint('El archivo seleccionado está vacío.')
        return
      }
      setFileHint(null)
      onDismissResult()
      onImport(text)
    }
    reader.onerror = () => {
      setFileHint('No se pudo leer el archivo. Verificá los permisos o el formato.')
    }
    reader.readAsText(f, 'UTF-8')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
      <div
        className="surface-card flex flex-col max-h-[90vh] w-full max-w-xl overflow-hidden animate-slide-up shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-csv-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-5">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                <Upload size={20} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col">
                <h2 id="import-csv-title" className="text-lg font-black tracking-tight text-text-main leading-none">Importar Catálogo</h2>
                <p className="mt-1.5 text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">Carga Masiva desde CSV</p>
             </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all hover:bg-border active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="space-y-4">
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface-soft border border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-black/20">
                   <FileText size={20} className="text-primary-600" />
                </div>
                <div>
                   <p className="text-sm font-black text-text-main">Estructura del archivo</p>
                   <p className="mt-1.5 text-xs font-medium text-text-muted leading-relaxed">
                      El archivo debe tener las siguientes columnas (la cabecera es opcional):
                   </p>
                   <div className="mt-3 p-2.5 rounded-lg bg-white/50 border border-border/50 font-mono text-[10px] text-text-muted leading-relaxed select-all">
                      nombre, costo, margen_pct, unidad, codigo_barras, categoria
                   </div>
                </div>
             </div>

             <div className="grid gap-3 px-1">
                <div className="flex items-center gap-2">
                   <Info size={14} className="text-primary-600" />
                   <p className="text-[10px] font-black text-text-subtle uppercase tracking-widest">Requisitos de Formato</p>
                </div>
                <ul className="grid gap-2">
                   <li className="flex items-center gap-3 text-xs font-bold text-text-muted">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-600 shrink-0" />
                      Separador de campos: Coma ( , )
                   </li>
                   <li className="flex items-center gap-3 text-xs font-bold text-text-muted">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-600 shrink-0" />
                      Separador decimal: Punto ( . ) o Coma ( , )
                   </li>
                   <li className="flex items-center gap-3 text-xs font-bold text-text-muted">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-600 shrink-0" />
                      Unidad y Código son opcionales
                   </li>
                </ul>
             </div>
          </div>

          <div className="pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) readFile(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              disabled={isImporting}
              className="btn-primary w-full h-14 shadow-xl shadow-primary-600/20 group"
              onClick={() => fileInputRef.current?.click()}
            >
              {isImporting ? (
                <div className="flex items-center gap-3 font-black uppercase tracking-widest text-sm">
                   <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Procesando...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <Download size={22} strokeWidth={3} className="transition-transform group-hover:translate-y-0.5" />
                   <span className="text-sm font-black uppercase tracking-widest">Seleccionar archivo .CSV</span>
                </div>
              )}
            </button>
          </div>

          {fileHint && (
            <div className="rounded-2xl border border-danger-100 bg-danger-50/50 p-4 flex items-start gap-3 animate-scale-in">
              <AlertCircle size={18} className="text-danger-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-danger-800 leading-tight">{fileHint}</p>
            </div>
          )}

          {lastResult && (
             <div className="space-y-4 animate-fade-in pt-2">
                <div className={`rounded-2xl border p-5 flex items-center justify-between ${
                   lastResult.errors.length > 0 ? 'border-warning-100 bg-warning-50/30' : 'border-primary-100 bg-primary-50/30'
                }`}>
                   <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${
                         lastResult.errors.length > 0 ? 'bg-accent-600' : 'bg-primary-600'
                      }`}>
                         {lastResult.errors.length > 0 ? <AlertCircle size={20} strokeWidth={3} /> : <CheckCircle2 size={20} strokeWidth={3} />}
                      </div>
                      <div>
                         <p className="text-xs font-black text-text-muted uppercase tracking-widest leading-none">Resultado</p>
                         <p className="mt-1.5 text-lg font-black text-text-main leading-none">
                            {lastResult.imported} importados con éxito
                         </p>
                      </div>
                   </div>
                </div>

                {lastResult.errors.length > 0 && (
                  <div className="rounded-2xl border border-warning-200 bg-surface p-5 space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-black text-warning-700 uppercase tracking-widest">Líneas con Observaciones ({lastResult.errors.length})</h3>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-border/50 pr-2 scrollbar-hide">
                      {[...lastResult.errors]
                        .sort((a, b) => a.line - b.line)
                        .map((e, idx) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                               <p className="text-xs font-bold text-text-main flex-1">{e.message}</p>
                               <span className="shrink-0 font-mono text-[10px] font-black text-text-subtle uppercase">FILA {e.line}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface px-6 py-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-32 h-12 text-xs font-black uppercase tracking-widest shadow-none border-none bg-surface-soft hover:bg-border/30"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
