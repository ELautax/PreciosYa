export type UserTier = 'free' | 'pro' | 'agency' | 'admin'

export type UserTierSource = {
  isAdmin?: boolean
  plan?: string | null
}

export function resolveUserTier(user: UserTierSource): UserTier {
  if (user.isAdmin) return 'admin'
  const plan = user.plan?.toUpperCase()
  if (plan === 'AGENCY') return 'agency'
  if (plan === 'PRO') return 'pro'
  return 'free'
}

export function getUserTierLabel(tier: UserTier): string {
  switch (tier) {
    case 'admin':
      return 'Admin'
    case 'agency':
      return 'Agency'
    case 'pro':
      return 'Pro'
    default:
      return 'Free'
  }
}

export const userTierBadgeClass: Record<UserTier, string> = {
  free: 'border-border bg-surface-soft text-text-subtle',
  pro: 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
  agency: 'border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-800 dark:bg-accent-900/30 dark:text-accent-400',
  admin: 'border-accent-500 bg-accent-500 text-white',
}
