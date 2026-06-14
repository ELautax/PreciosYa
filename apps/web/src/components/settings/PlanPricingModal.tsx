import { useEffect } from 'react'
import { CreditCard, X } from 'lucide-react'

import { PlanPricingCards } from '@/components/settings/PlanPricingCards'
import type { PlanId } from '@/components/settings/planTiers'

type PlanPricingModalProps = {
  open: boolean
  currentPlan: PlanId
  onClose: () => void
  onSubscribePro?: () => void
  subscribeProLoading?: boolean
  mpConfigured?: boolean
}

export function PlanPricingModal({
  open,
  currentPlan,
  onClose,
  onSubscribePro,
  subscribeProLoading = false,
  mpConfigured = true,
}: PlanPricingModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="surface-card flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] shadow-2xl animate-slide-up sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-pricing-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/40 sm:hidden" />

        <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
              <CreditCard size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h2 id="plan-pricing-title" className="text-lg font-black tracking-tight text-text-main leading-none">
                Compará planes
              </h2>
              <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-text-subtle leading-none">
                Pro se paga con Mercado Pago · Agency por contacto
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all hover:bg-border active:scale-90"
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 scrollbar-hide sm:p-6">
          <PlanPricingCards
            currentPlan={currentPlan}
            onSubscribePro={onSubscribePro}
            subscribeProLoading={subscribeProLoading}
            mpConfigured={mpConfigured}
          />
        </div>
      </div>
    </div>
  )
}
