type IPCBannerProps = {
  ipcPct: number | null
  onOpenBulk: () => void
}

export function IPCBanner({ ipcPct, onOpenBulk }: IPCBannerProps) {
  if (ipcPct === null) return null

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-900">
            IPC disponible: {ipcPct.toFixed(2)}%
          </p>
          <p className="text-xs text-amber-800">
            Podés aplicarlo a todos los productos del local actual.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenBulk}
          className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
        >
          Actualizar costos
        </button>
      </div>
    </div>
  )
}
