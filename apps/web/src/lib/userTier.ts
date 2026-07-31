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
  free: 'border-border-strong bg-surface-soft text-text-muted',
  pro: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-200 dark:text-primary-600',
  agency: 'border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-200 dark:text-accent-500',
  admin: 'border-accent-600 bg-accent-600 text-white dark:border-accent-500 dark:bg-accent-500 dark:text-text-main',
}
