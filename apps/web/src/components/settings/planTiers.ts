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
  'mailto:sales@preciosya.com?subject=Consulta%20plan%20Agency%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20una%20cotizaci%C3%B3n%20del%20plan%20Agency.%0A%0AEmpresa%20%2F%20rubro%3A%20%0ACantidad%20de%20locales%20%2F%20sucursales%3A%20%0ACantidad%20aproximada%20de%20productos%3A%20%0A%C2%BFC%C3%B3mo%20nos%20conociste%3F%20%0A'

export const PRO_MAIL =
  'mailto:sales@preciosya.com?subject=Consulta%20plan%20Pro%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20pasar%20al%20plan%20Pro.%0A%0ALocal%20%2F%20negocio%3A%20%0A%0A'

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
      'IPC por rubro + indexar USD BCRA',
      'Alertas de margen y lista PNG',
      'Escáner de código de barras',
      'Registro de ventas (historial 7 días)',
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
      'Todo lo del plan Free',
      'Gestor de ventas completo (analytics)',
      'Períodos de ventas extendidos',
      'Email al publicarse IPC nuevo',
      'Prioridad de soporte',
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
    subtitle: 'Cotización según cantidad de locales/sucursales y productos',
    features: [
      'Locales y productos ilimitados',
      'Ideal para cadenas, estudios y varios puntos de venta',
      'Todo lo de Pro (IPC, USD, analytics)',
      'Análisis de ventas y rentabilidad',
      'Soporte prioritario',
      'Ayuda al armar locales y catálogo (por mail, al contratar)',
    ],
    footerNote:
      'Sin precio fijo. Escribinos indicando locales y volumen de productos; armamos un precio que sea rentable para ambos, sin compromiso.',
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
