import {
  getUserTierLabel,
  resolveUserTier,
  userTierBadgeClass,
  type UserTier,
  type UserTierSource,
} from '@/lib/userTier'

type UserTierBadgeProps = {
  tier?: UserTier
  user?: UserTierSource | null
  size?: 'sm' | 'md'
  className?: string
}

export function UserTierBadge({
  tier,
  user,
  size = 'sm',
  className = '',
}: UserTierBadgeProps) {
  const resolved = tier ?? (user ? resolveUserTier(user) : 'free')
  const label = getUserTierLabel(resolved)
  const sizeClass =
    size === 'md'
      ? 'px-2.5 py-1 text-[11px] tracking-widest'
      : 'px-2 py-0.5 text-[9px] tracking-widest'

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-black uppercase ${sizeClass} ${userTierBadgeClass[resolved]} ${className}`}
    >
      {label}
    </span>
  )
}
