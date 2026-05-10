type IPCBannerProps = {
  ipcPct: number | null
  onOpenBulk: () => void
}

export function IPCBanner({ ipcPct, onOpenBulk }: IPCBannerProps) {
  if (ipcPct === null) return null

  return (
    <div className="surface-card mt-6 border-amber-300/60 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-900">
            IPC disponible: <span className="mono">{ipcPct.toFixed(2)}%</span>
          </p>
          <p className="text-sm text-amber-800">
            Podés aplicarlo a todos los productos del local actual.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenBulk}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Actualizar costos
        </button>
      </div>
    </div>
  )
}
