import { Check, Mail } from 'lucide-react'

type PlanId = 'FREE' | 'PRO' | 'AGENCY'

type PlanTier = {
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

const LANDING_PRICING_URL = 'https://preciosya-landing.vercel.app/#precios'

const AGENCY_MAIL =
  'mailto:hola@preciosya.app?subject=Consulta%20plan%20Agency%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20una%20propuesta%20para%20el%20plan%20Agency.%0A%0AEmpresa%20%2F%20rubro%3A%20%0ACantidad%20de%20locales%20o%20clientes%3A%20%0A%C2%BFC%C3%B3mo%20nos%20conociste%3F%20%0A'

const PRO_MAIL =
  'mailto:hola@preciosya.app?subject=Consulta%20plan%20Pro%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20pasar%20al%20plan%20Pro.%0A%0ALocal%20%2F%20negocio%3A%20%0A%0A'

const PLANS: PlanTier[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    priceSuffix: '/siempre',
    features: [
      'Hasta 30 productos y 1 local',
      'Cálculo automático de margen y precio',
      'Rubros INDEC (activás los que uses)',
      'Escáner de código de barras',
      'Lista de precios PNG para WhatsApp',
    ],
    cta: {
      label: 'Empezar gratis',
      href: LANDING_PRICING_URL,
      external: true,
      variant: 'secondary',
    },
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$4.500',
    priceSuffix: '/mes',
    featured: true,
    features: [
      'Productos ilimitados y hasta 3 locales',
      'IPC por rubro — aplicación en un toque',
      'Indexar al dólar BCRA por rubro',
      'Alertas cuando el margen baja del mínimo',
      'Historial, actualización masiva y notificaciones',
    ],
    cta: {
      label: 'Consultar Pro',
      href: PRO_MAIL,
      variant: 'primary',
    },
  },
  {
    id: 'AGENCY',
    name: 'Agency',
    price: 'A medida',
    subtitle: 'Para estudios, contadores y redes con varios negocios o clientes',
    features: [
      'Locales y productos ilimitados',
      'Multi-negocio y multi-cliente',
      'IPC + dólar BCRA en todos los rubros',
      'Soporte prioritario',
      'Onboarding y configuración asistida',
    ],
    footerNote:
      'Sin precio fijo publicado. Te respondemos con una propuesta según volumen y necesidades, sin compromiso.',
    cta: {
      label: 'Contactar ventas',
      href: AGENCY_MAIL,
      variant: 'dark',
    },
  },
]

const ctaClass: Record<PlanTier['cta']['variant'], string> = {
  primary: 'btn-primary shadow-xl shadow-primary-600/20',
  secondary: 'btn-secondary',
  dark: 'btn-base bg-text-main text-canvas shadow-warm-md hover:opacity-90',
}

type PlanPricingCardsProps = {
  currentPlan: PlanId
}

export function PlanPricingCards({ currentPlan }: PlanPricingCardsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[2rem] border p-5 sm:p-6 transition-all ${
                plan.featured
                  ? 'border-primary-600/40 bg-primary-50/10 shadow-xl shadow-primary-600/10 ring-1 ring-primary-600/20'
                  : 'border-border/60 bg-surface-soft/80'
              } ${plan.id === 'AGENCY' ? 'border-border-strong/80' : ''}`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
                  Recomendado
                </span>
              )}

              {isCurrent && (
                <span className="absolute top-4 right-4 rounded-full bg-accent-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
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
                ) : (
                  <a
                    href={plan.cta.href}
                    target={plan.cta.external ? '_blank' : undefined}
                    rel={plan.cta.external ? 'noopener noreferrer' : undefined}
                    className={`${ctaClass[plan.cta.variant]} w-full text-xs font-black uppercase tracking-widest`}
                  >
                    {plan.cta.variant === 'dark' || plan.cta.href.startsWith('mailto:') ? (
                      <Mail size={16} strokeWidth={2.5} aria-hidden />
                    ) : null}
                    {plan.cta.label}
                  </a>
                )}
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
        })}
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

export function planProductLimit(plan: PlanId): number | null {
  if (plan === 'FREE') return 30
  return null
}

export function planLocalLimit(plan: PlanId): number | null {
  if (plan === 'FREE') return 1
  if (plan === 'PRO') return 3
  return null
}
