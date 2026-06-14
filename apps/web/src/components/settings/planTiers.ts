export type PlanId = 'FREE' | 'PRO' | 'AGENCY'

export type PlanTier = {
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
    action?: 'mp_checkout' | 'mailto' | 'external'
    external?: boolean
    variant: 'primary' | 'secondary' | 'dark'
  }
}

export const LANDING_PRICING_URL = 'https://preciosya-landing.vercel.app/#precios'

export const AGENCY_MAIL =
  'mailto:hola@preciosya.app?subject=Consulta%20plan%20Agency%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20una%20propuesta%20para%20el%20plan%20Agency.%0A%0AEmpresa%20%2F%20rubro%3A%20%0ACantidad%20de%20locales%20o%20clientes%3A%20%0A%C2%BFC%C3%B3mo%20nos%20conociste%3F%20%0A'

export const PRO_MAIL =
  'mailto:hola@preciosya.app?subject=Consulta%20plan%20Pro%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20pasar%20al%20plan%20Pro.%0A%0ALocal%20%2F%20negocio%3A%20%0A%0A'

/** Ruta interna para iniciar checkout Pro (requiere sesión). */
export const PRO_CHECKOUT_PATH = '/settings?tab=plan&planes=1&checkout=start'

export const PLANS: PlanTier[] = [
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
      'Registro de ventas (7 días)',
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
      'Productos ilimitados · 3 locales',
      'IPC por rubro en un toque',
      'Indexar al dólar BCRA',
      'Alertas de margen mínimo',
      'Historial y actualización masiva',
      'Gestor de ventas completo',
    ],
    cta: {
      label: 'Suscribirme a Pro',
      href: PRO_CHECKOUT_PATH,
      action: 'mp_checkout',
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
      'Análisis de ventas y rentabilidad',
      'Soporte prioritario',
      'Onboarding y configuración asistida',
    ],
    footerNote:
      'Sin precio fijo publicado. Te respondemos con una propuesta según volumen y necesidades, sin compromiso.',
    cta: {
      label: 'Contactar ventas',
      href: AGENCY_MAIL,
      action: 'mailto',
      variant: 'dark',
    },
  },
]

export function planProductLimit(plan: PlanId): number | null {
  if (plan === 'FREE') return 30
  return null
}

export function planLocalLimit(plan: PlanId): number | null {
  if (plan === 'FREE') return 1
  if (plan === 'PRO') return 3
  return null
}
