import { useMemo, useState } from 'react'
import { Barcode, ChevronDown, ChevronUp, Search } from 'lucide-react'

import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/components/sales/format'
import { SaleDateTimeField } from '@/components/sales/SaleDateTimeField'
import { SaleRegisterDraft } from '@/components/sales/SaleRegisterDraft'
import { BarcodeScanner } from '@/components/products/BarcodeScanner'
import { useApiClient } from '@/hooks/useApiClient'
import { useCreateSale } from '@/hooks/useSales'
import { useProducts, type ProductListResult } from '@/hooks/useProducts'
import { appToast } from '@/lib/toast'
import type { ApiSuccess } from 'shared'
import type { ProductDto } from '@/types/product'
import type { SaleDraftItem } from '@/types/sales'

type SaleRegisterTabProps = {
  localId: string
}

function productToDraft(p: ProductDto, quantity = 1): SaleDraftItem {
  return {
    productId: p.id,
    name: p.name,
    unit: p.unit,
    salePrice: p.salePrice,
    quantity,
  }
}

export function SaleRegisterTab({ localId }: SaleRegisterTabProps) {
  const [search, setSearch] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [draft, setDraft] = useState<SaleDraftItem[]>([])
  const [soldAtLocal, setSoldAtLocal] = useState(toDatetimeLocalValue())
  const [note, setNote] = useState('')
  const [showWhen, setShowWhen] = useState(false)

  const productsQ = useProducts(localId, { search, limit: 8, page: 1 })
  const createMut = useCreateSale(localId)
  const api = useApiClient()

  const draftTotal = useMemo(
    () => draft.reduce((s, i) => s + i.salePrice * i.quantity, 0),
    [draft],
  )

  function addProduct(p: ProductDto) {
    setDraft((prev) => {
      const existing = prev.find((i) => i.productId === p.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, productToDraft(p)]
    })
    setSearch('')
  }

  function onBarcode(code: string) {
    setScannerOpen(false)
    void api
      .get<ApiSuccess<ProductListResult>>('/api/products', {
        params: { localId, search: code, limit: 10, page: 1 },
      })
      .then((res) => {
        const exact = res.data.data.items.find((p) => p.barcode === code)
        if (exact) {
          addProduct(exact)
          return
        }
        setSearch(code)
        appToast.info('No encontramos ese código exacto en el catálogo')
      })
      .catch(() => {
        setSearch(code)
        appToast.error('No se pudo buscar el producto')
      })
  }

  async function confirmSale() {
    if (draft.length === 0) return
    const payload = {
      note: note.trim() || null,
      items: draft.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      // «Ahora»: no mandar soldAt → el servidor usa new Date() (día Argentina correcto)
      ...(showWhen
        ? { soldAt: fromDatetimeLocalValue(soldAtLocal).toISOString() }
        : {}),
    }
    await createMut.mutateAsync(payload)
    setDraft([])
    setNote('')
    setSoldAtLocal(toDatetimeLocalValue())
    setShowWhen(false)
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => setScannerOpen(true)} className="btn-primary flex-1">
          <Barcode size={18} strokeWidth={2.5} />
          Escanear código
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="pl-11"
        />
      </div>

      {search && productsQ.data && productsQ.data.items.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border bg-surface p-2">
          {productsQ.data.items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-surface-soft"
            >
              <span className="text-sm font-bold text-text-main">{p.name}</span>
              <span className="font-mono text-xs font-black text-primary-600">
                ${p.salePrice.toLocaleString('es-AR')}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <SaleRegisterDraft
        items={draft}
        onChangeQuantity={(productId, quantity) =>
          setDraft((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)))
        }
        onRemove={(productId) => setDraft((prev) => prev.filter((i) => i.productId !== productId))}
      />

      <div className="rounded-2xl border border-border bg-surface-soft/40">
        <button
          type="button"
          onClick={() => setShowWhen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <span className="text-xs font-bold text-text-muted">
            Fecha y hora · {showWhen ? 'personalizada' : 'ahora'}
          </span>
          {showWhen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showWhen ? (
          <div className="border-t border-border px-4 pb-4 pt-2">
            <SaleDateTimeField value={soldAtLocal} onChange={setSoldAtLocal} />
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="px-1 text-xs font-bold text-text-subtle">Nota (opcional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. carga del mediodía"
          maxLength={500}
        />
      </div>

      {/* bottom-nav ~4rem + safe-area: CTA encima sin taparse */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-surface/95 p-3 shadow-warm-lg backdrop-blur-md sm:static sm:z-auto sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <button
          type="button"
          disabled={draft.length === 0 || createMut.isPending}
          onClick={() => void confirmSale()}
          className="btn-primary w-full shadow-xl shadow-primary-600/20 transition-all active:scale-95"
        >
          {createMut.isPending
            ? 'Guardando…'
            : `Confirmar venta${draftTotal > 0 ? ` · $${draftTotal.toLocaleString('es-AR')}` : ''}`}
        </button>
      </div>

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={onBarcode} />
    </div>
  )
}
