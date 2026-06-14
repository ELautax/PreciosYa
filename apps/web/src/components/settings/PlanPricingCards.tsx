import { PlanPricingCard } from '@/components/settings/PlanPricingCard'
import { PLANS, type PlanId } from '@/components/settings/planTiers'

export { planLocalLimit, planProductLimit } from '@/components/settings/planTiers'
export type { PlanId } from '@/components/settings/planTiers'

type PlanPricingCardsProps = {
  currentPlan: PlanId
  onSubscribePro?: () => void
  subscribeProLoading?: boolean
  mpConfigured?: boolean
}

export function PlanPricingCards({
  currentPlan,
  onSubscribePro,
  subscribeProLoading = false,
  mpConfigured = true,
}: PlanPricingCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
      {PLANS.map((plan) => (
        <PlanPricingCard
          key={plan.id}
          plan={plan}
          currentPlan={currentPlan}
          onSubscribePro={plan.id === 'PRO' ? onSubscribePro : undefined}
          subscribeProLoading={subscribeProLoading}
          mpConfigured={mpConfigured}
        />
      ))}
    </div>
  )
}
