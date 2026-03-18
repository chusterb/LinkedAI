import { isPro } from '../lib/plans'

describe('isPro', () => {
  it('returns false for null planData', () => {
    expect(isPro(null)).toBe(false)
  })

  it('returns false for free plan', () => {
    expect(isPro({ plan: 'free', plan_expires_at: null })).toBe(false)
  })

  it('returns true for pro plan with no expiry', () => {
    expect(isPro({ plan: 'pro', plan_expires_at: null })).toBe(true)
  })

  it('returns true for pro plan with future expiry', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(isPro({ plan: 'pro', plan_expires_at: future })).toBe(true)
  })

  it('returns false for pro plan with past expiry', () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    expect(isPro({ plan: 'pro', plan_expires_at: past })).toBe(false)
  })
})
