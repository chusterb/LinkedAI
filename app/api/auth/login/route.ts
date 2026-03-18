import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: 'openid profile email w_member_social',
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/?auth_error=1`)
  }

  const response = NextResponse.redirect(data.url)
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })
  return response
}
