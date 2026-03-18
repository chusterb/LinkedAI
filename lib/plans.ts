// Shared plan validation logic

export interface PlanData {
  plan: string | null
  plan_expires_at: string | null
}

export function isPro(planData: PlanData | null | undefined): boolean {
  if (!planData || planData.plan !== 'pro') return false
  if (!planData.plan_expires_at) return true
  return new Date(planData.plan_expires_at) > new Date()
}

export const FREE_DAILY_LIMIT = 3
