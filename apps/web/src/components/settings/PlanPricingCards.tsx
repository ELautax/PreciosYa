import { PlanPricingCard } from '@/components/settings/PlanPricingCard'
import { LANDING_PRICING_URL, PLANS, type PlanId } from '@/components/settings/planTiers'

export { planLocalLimit, planProductLimit } from '@/components/settings/planTiers'
export type { PlanId } from '@/components/settings/planTiers'

type PlanPricingCardsProps = {
  currentPlan: PlanId
}

export function PlanPricingCards({ currentPlan }: PlanPricingCardsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
        {PLANS.map((plan) => (
          <PlanPricingCard key={plan.id} plan={plan} isCurrent={plan.id === currentPlan} />
        ))}
      </div>

      <p className="rounded-2xl border border-primary-100 bg-primary-50/20 px-4 py-3 text-[10px] font-bold uppercase leading-relaxed tracking-tight text-text-muted">
        En Free probás la app con límites de capacidad. Pro desbloquea IPC, dólar BCRA, alertas e historial
        completo. Agency se cotiza a medida.
      </p>

      <a
        href={LANDING_PRICING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:underline"
      >
        Ver comparativa en la web
      </a>
    </div>
  )
}
