import { useState } from 'react'
import { Barcode, Search } from 'lucide-react'

import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/components/sales/format'
import { SaleDateTimeField } from '@/components/sales/SaleDateTimeField'
import { SaleRegisterDraft } from '@/components/sales/SaleRegisterDraft'
import { BarcodeScanner } from '@/components/products/BarcodeScanner'
import { useApiClient } from '@/hooks/useApiClient'
import { useCreateSale } from '@/hooks/useSales'
import { useProducts, type ProductListResult } from '@/hooks/useProducts'
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
        params: { localId, search: code, limit: 5, page: 1 },
      })
      .then((res) => {
        const exact = res.data.data.items.find((p) => p.barcode === code)
        const match = exact ?? res.data.data.items[0]
        if (match) addProduct(match)
        else setSearch(code)
      })
      .catch(() => setSearch(code))
  }

  async function confirmSale() {
    if (draft.length === 0) return
    await createMut.mutateAsync({
      soldAt: fromDatetimeLocalValue(soldAtLocal).toISOString(),
      note: note.trim() || null,
      items: draft.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    })
    setDraft([])
    setNote('')
    setSoldAtLocal(toDatetimeLocalValue())
  }

  return (
    <div className="space-y-6">
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

      {search && productsQ.data && productsQ.data.items.length > 0 && (
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
      )}

      <SaleRegisterDraft
        items={draft}
        onChangeQuantity={(productId, quantity) =>
          setDraft((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)))
        }
        onRemove={(productId) => setDraft((prev) => prev.filter((i) => i.productId !== productId))}
      />

      <SaleDateTimeField value={soldAtLocal} onChange={setSoldAtLocal} />

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">
          Nota (opcional)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. carga del mediodía"
          maxLength={500}
        />
      </div>

      <button
        type="button"
        disabled={draft.length === 0 || createMut.isPending}
        onClick={() => void confirmSale()}
        className="btn-primary w-full"
      >
        {createMut.isPending
          ? 'Guardando…'
          : `Confirmar venta${draftTotal > 0 ? ` · $${draftTotal.toLocaleString('es-AR')}` : ''}`}
      </button>

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={onBarcode} />
    </div>
  )
}
