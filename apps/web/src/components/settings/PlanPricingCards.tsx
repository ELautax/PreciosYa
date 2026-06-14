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
  const mpTestMode = subscriptionQ.data?.mpTestMode ?? false
  const mpLoading = subscriptionQ.isLoading

  async function handleSubscribePro(): Promise<void> {
    setLocalError(null)
    try {
      const data = await checkoutM.mutateAsync()
      if (data.testMode || data.sandboxHint === 'sandbox_guest_checkout') {
        const ok = window.confirm(
          'Modo prueba Mercado Pago\n\n' +
            '1. Abrí el checkout en ventana incógnito si podés.\n' +
            '2. NO inicies sesión con tu cuenta real de Mercado Pago.\n' +
            '3. NO uses el usuario TESTUSER… (provoca error "parte de prueba").\n' +
            '4. Pagá con tarjeta de prueba NUEVA:\n' +
            '   5031 7557 3453 0604 · Titular APRO · CVV 123 · DNI 12345678\n' +
            '5. Si ves otra cuenta logueada, cerrá sesión antes de pagar.\n\n' +
            '¿Continuar al checkout de Mercado Pago?',
        )
        if (!ok) return
      }
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
      {mpTestMode ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">Modo prueba (TEST).</span> Al pagar en Mercado Pago, no uses tu
          cuenta real ni el usuario TESTUSER. Completá con la tarjeta de prueba (APRO · 5031…0604).
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
