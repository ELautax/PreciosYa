import { useRef, useState } from 'react'

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
        setFileHint('El archivo está vacío.')
        return
      }
      setFileHint(null)
      onDismissResult()
      onImport(text)
    }
    reader.onerror = () => {
      setFileHint('No pudimos leer el archivo.')
    }
    reader.readAsText(f, 'UTF-8')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="surface-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-csv-title"
      >
        <h2 id="import-csv-title" className="text-lg font-semibold text-stone-900">
          Importar CSV
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Filas con cabecera opcional:{' '}
          <span className="mono text-xs">
            nombre,costo,margen_pct,unidad,codigo_barras,categoria
          </span>{' '}
          (las últimas tres columnas son opcionales). Sin cabecera, el orden es el mismo. Usá punto
          como separador decimal en costo y margen, o coma única en decimales tipo 12,50.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
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
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
          >
            Elegir archivo .csv
          </button>
          <button type="button" className="btn-soft" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {fileHint ? (
          <p className="mt-3 text-sm text-amber-800" role="alert">
            {fileHint}
          </p>
        ) : null}

        {isImporting ? (
          <p className="mt-4 text-sm text-stone-600">Importando…</p>
        ) : null}

        {lastResult && lastResult.errors.length > 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-950">
              Importados: {lastResult.imported}. Revisá estas líneas del archivo:
            </p>
            <ul className="mt-2 max-h-48 list-inside list-disc space-y-1 overflow-y-auto text-sm text-amber-900">
              {[...lastResult.errors]
                .sort((a, b) => a.line - b.line)
                .map((e) => (
                  <li key={`${e.line}-${e.message.slice(0, 24)}`}>
                    <span className="mono">Línea {e.line}</span>: {e.message}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
