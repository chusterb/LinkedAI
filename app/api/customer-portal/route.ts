import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/?auth_error=1', req.url))
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    return NextResponse.redirect(new URL('/dashboard?portal_error=1', req.url))
  }

  // Récupère le lemon_subscription_id depuis la base
  const admin = createAdminClient()
  const { data: planData } = await admin
    .from('user_plans')
    .select('lemon_subscription_id')
    .eq('user_id', user.id)
    .single()

  const subId = planData?.lemon_subscription_id
  if (!subId) {
    // Pas d'abonnement trouvé → renvoie vers LemonSqueezy my-orders
    return NextResponse.redirect('https://app.lemonsqueezy.com/my-orders')
  }

  try {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const data = await res.json()
    const portalUrl = data?.data?.attributes?.urls?.customer_portal

    if (!portalUrl) {
      return NextResponse.redirect(new URL('/dashboard?portal_error=1', req.url))
    }

    return NextResponse.redirect(portalUrl)
  } catch {
    return NextResponse.redirect(new URL('/dashboard?portal_error=1', req.url))
  }
}
