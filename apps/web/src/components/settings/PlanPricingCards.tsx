import { useState } from 'react'

import { PlanPricingCard } from '@/components/settings/PlanPricingCard'
import { PLANS, type PlanId } from '@/components/settings/planTiers'
import { useProCheckout, useSubscriptionStatus } from '@/hooks/useSubscription'

export { planLocalLimit, planProductLimit } from '@/components/settings/planTiers'
export type { PlanId } from '@/components/settings/planTiers'

type PlanPricingCardsProps = {
  currentPlan: PlanId
  onCheckoutError?: (message: string) => void
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { error?: { message?: string } } } }).response?.data
    if (data?.error?.message) return data.error.message
  }
  if (error instanceof Error) return error.message
  return 'No se pudo iniciar el pago con Mercado Pago'
}

export function PlanPricingCards({ currentPlan, onCheckoutError }: PlanPricingCardsProps) {
  const subscriptionQ = useSubscriptionStatus()
  const checkoutM = useProCheckout()
  const [localError, setLocalError] = useState<string | null>(null)

  const mpConfigured = subscriptionQ.data?.mpConfigured ?? false
  const mpLoading = subscriptionQ.isLoading

  async function handleSubscribePro(): Promise<void> {
    setLocalError(null)
    try {
      const data = await checkoutM.mutateAsync()
      window.location.href = data.checkoutUrl
    } catch (e) {
      const message = extractErrorMessage(e)
      setLocalError(message)
      onCheckoutError?.(message)
    }
  }

  return (
    <div className="space-y-3">
      {localError ? (
        <p className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-800">
          {localError}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
        {PLANS.map((plan) => (
          <PlanPricingCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onSubscribePro={plan.id === 'PRO' ? () => void handleSubscribePro() : undefined}
            subscribeProLoading={checkoutM.isPending}
            mpConfigured={mpConfigured}
            mpLoading={mpLoading}
          />
        ))}
      </div>
    </div>
  )
}
