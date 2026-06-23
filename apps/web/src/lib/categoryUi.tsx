import {
  Apple,
  Wine,
  Shirt,
  Home,
  Armchair,
  Stethoscope,
  Car,
  Smartphone,
  Gamepad2,
  GraduationCap,
  Utensils,
  Package,
  Tags,
  type LucideIcon
} from 'lucide-react'

export type CategoryUiInfo = {
  icon: LucideIcon
  colorHex: string
}

export const CATEGORY_UI_MAP: Record<string, CategoryUiInfo> = {
  alimentos: { icon: Apple, colorHex: '#16A34A' },
  'bebidas-tabaco': { icon: Wine, colorHex: '#854D0E' },
  vestimenta: { icon: Shirt, colorHex: '#7C3AED' },
  vivienda: { icon: Home, colorHex: '#2563EB' },
  hogar: { icon: Armchair, colorHex: '#0891B2' },
  salud: { icon: Stethoscope, colorHex: '#DC2626' },
  transporte: { icon: Car, colorHex: '#EA580C' },
  comunicacion: { icon: Smartphone, colorHex: '#4F46E5' },
  recreacion: { icon: Gamepad2, colorHex: '#DB2777' },
  educacion: { icon: GraduationCap, colorHex: '#0D9488' },
  restaurantes: { icon: Utensils, colorHex: '#CA8A04' },
  varios: { icon: Package, colorHex: '#64748B' },
  otros: { icon: Tags, colorHex: '#78716C' },
}

export function getCategoryUi(slug: string | null, fallbackColor?: string): CategoryUiInfo {
  const info = slug ? CATEGORY_UI_MAP[slug] : null
  return {
    icon: info?.icon ?? Tags,
    colorHex: info?.colorHex ?? fallbackColor ?? '#78716C',
  }
}

interface CategoryAvatarProps {
  slug: string | null
  fallbackColor?: string
  size?: number
  className?: string
}

export function CategoryAvatar({ slug, fallbackColor, size = 20, className = "" }: CategoryAvatarProps) {
  const { icon: Icon, colorHex } = getCategoryUi(slug, fallbackColor)
  
  return (
    <div 
      className={`flex items-center justify-center rounded-xl shadow-inner shrink-0 ${className}`}
      style={{ 
        backgroundColor: `${colorHex}15`, 
        color: colorHex,
        width: size * 1.8,
        height: size * 1.8
      }}
    >
      <Icon size={size} strokeWidth={2.5} />
    </div>
  )
}
