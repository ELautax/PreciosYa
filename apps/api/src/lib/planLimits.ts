import type { PlanType } from '@prisma/client'

export function maxLocalsForPlan(plan: PlanType): number {
  if (plan === 'FREE') return 1
  if (plan === 'PRO') return 3
  return Number.POSITIVE_INFINITY
}

export function maxActiveProductsForPlan(plan: PlanType): number {
  if (plan === 'FREE') return 30
  return Number.POSITIVE_INFINITY
}

export function isWithinLimit(
  count: number,
  max: number,
): boolean {
  if (max === Number.POSITIVE_INFINITY) return true
  return count < max
}
