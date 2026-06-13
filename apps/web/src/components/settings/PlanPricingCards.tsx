import { PlanPricingCard } from '@/components/settings/PlanPricingCard'
import { PLANS, type PlanId } from '@/components/settings/planTiers'

export { planLocalLimit, planProductLimit } from '@/components/settings/planTiers'
export type { PlanId } from '@/components/settings/planTiers'

type PlanPricingCardsProps = {
  currentPlan: PlanId
}

export function PlanPricingCards({ currentPlan }: PlanPricingCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
      {PLANS.map((plan) => (
        <PlanPricingCard key={plan.id} plan={plan} currentPlan={currentPlan} />
      ))}
    </div>
  )
}
