'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!POSTHOG_KEY) return
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // on gère manuellement
      persistence: 'localStorage',
    })
  }, [])

  // Pageview à chaque navigation
  useEffect(() => {
    if (!POSTHOG_KEY) return
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}

/** Hook utilitaire pour tracker des events depuis n'importe quel composant */
export function usePostHog() {
  const capture = (event: string, props?: Record<string, unknown>) => {
    if (!POSTHOG_KEY) return
    posthog.capture(event, props)
  }
  return { capture }
}
