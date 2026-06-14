import { Check, CreditCard, Loader2, Mail } from 'lucide-react'

import type { PlanId } from '@/components/settings/planTiers'
import { PRO_CHECKOUT_PATH } from '@/components/settings/planTiers'

export type PlanTierView = {
  id: PlanId
  name: string
  price: string
  priceSuffix?: string
  subtitle?: string
  featured?: boolean
  features: string[]
  footerNote?: string
  cta: {
    label: string
    href: string
    external?: boolean
    variant: 'primary' | 'secondary' | 'dark'
  }
}

const ctaClass: Record<PlanTierView['cta']['variant'], string> = {
  primary: 'btn-primary shadow-xl shadow-primary-600/20',
  secondary: 'btn-secondary',
  dark: 'btn-base bg-text-main text-canvas shadow-warm-md hover:opacity-90',
}

type PlanPricingCardProps = {
  plan: PlanTierView
  currentPlan: PlanId
  onSubscribePro?: () => void
  subscribeProLoading?: boolean
  mpConfigured?: boolean
}

export function PlanPricingCard({
  plan,
  currentPlan,
  onSubscribePro,
  subscribeProLoading = false,
  mpConfigured = true,
}: PlanPricingCardProps) {
  const isCurrent = plan.id === currentPlan
  const hideCta = plan.id === 'FREE' && !isCurrent
  const isProCheckout = plan.id === 'PRO' && plan.cta.href === PRO_CHECKOUT_PATH
  const isMailto = plan.cta.href.startsWith('mailto:')

  function renderCtaContent() {
    if (subscribeProLoading) {
      return (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Redirigiendo…
        </>
      )
    }
    if (isProCheckout) {
      return (
        <>
          <CreditCard size={16} strokeWidth={2.5} aria-hidden />
          {plan.cta.label}
        </>
      )
    }
    if (isMailto || plan.cta.variant === 'dark') {
      return (
        <>
          <Mail size={16} strokeWidth={2.5} aria-hidden />
          {plan.cta.label}
        </>
      )
    }
    return plan.cta.label
  }

  return (
    <article
      className={`relative flex h-full flex-col rounded-[2rem] border p-5 sm:p-6 transition-shadow ${
        plan.featured
          ? 'border-primary-600/40 bg-primary-50/10 shadow-xl shadow-primary-600/10 ring-1 ring-primary-600/20'
          : 'border-border/60 bg-surface-soft/80'
      } ${plan.id === 'AGENCY' ? 'border-border-strong/80' : ''}`}
    >
      {plan.featured && !isCurrent && currentPlan === 'FREE' && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
          Recomendado
        </span>
      )}

      {isCurrent && (
        <span className="absolute top-4 right-4 z-10 rounded-full bg-accent-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
          Actual
        </span>
      )}

      <div className="mb-5 min-h-[5.5rem]">
        <h3 className="text-lg font-black tracking-tight text-text-main">{plan.name}</h3>
        <p className="mt-2 font-mono text-3xl font-black tracking-tighter text-text-main">
          {plan.price}
          {plan.priceSuffix ? (
            <span className="ml-1 text-sm font-bold text-text-subtle">{plan.priceSuffix}</span>
          ) : null}
        </p>
        {plan.subtitle ? (
          <p className="mt-2 text-xs font-semibold leading-relaxed text-text-muted">{plan.subtitle}</p>
        ) : null}
      </div>

      <ul className="mb-0 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-xs font-semibold leading-snug text-text-muted">
            <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {isCurrent ? (
          <button type="button" disabled className="btn-secondary w-full">
            Tu plan actual
          </button>
        ) : hideCta ? (
          <div className="min-h-[48px]" aria-hidden />
        ) : isProCheckout && onSubscribePro ? (
          <button
            type="button"
            onClick={onSubscribePro}
            disabled={subscribeProLoading || !mpConfigured}
            className={`${ctaClass[plan.cta.variant]} w-full text-xs font-black uppercase tracking-widest disabled:opacity-60`}
          >
            {renderCtaContent()}
          </button>
        ) : (
          <a
            href={plan.cta.href}
            target={plan.cta.external ? '_blank' : undefined}
            rel={plan.cta.external ? 'noopener noreferrer' : undefined}
            className={`${ctaClass[plan.cta.variant]} w-full text-xs font-black uppercase tracking-widest`}
          >
            {renderCtaContent()}
          </a>
        )}
        {!mpConfigured && isProCheckout && !isCurrent ? (
          <p className="mt-2 text-[10px] font-semibold text-amber-700">
            Pagos en configuración. Escribinos a hola@preciosya.app mientras tanto.
          </p>
        ) : null}
        <p
          className={`mt-3 min-h-[3rem] text-[10px] font-semibold leading-relaxed text-text-subtle ${
            plan.footerNote ? '' : 'invisible'
          }`}
          aria-hidden={!plan.footerNote}
        >
          {plan.footerNote ?? '\u00A0'}
        </p>
      </div>
    </article>
  )
}
