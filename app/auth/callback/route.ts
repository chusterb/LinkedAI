import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Prevent open redirect: only allow relative paths
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookiesToSet.push({ name, value, options })
          },
          remove(name: string, options: Record<string, unknown>) {
            cookiesToSet.push({ name, value: '', options: { ...options, maxAge: 0 } })
          },
          getAll() { return cookieStore.getAll() },
          setAll(incoming: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
            incoming.forEach(c => cookiesToSet.push(c))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })
      return response
    }
    console.error('[auth/callback] exchangeCodeForSession error:', error)
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`)
}
