import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  // Vérification de la signature HMAC
  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const digest = createHmac('sha256', secret).update(rawBody).digest('hex')
  const digestBuf = Buffer.from(digest)
  const signatureBuf = Buffer.from(signature)
  if (digestBuf.length !== signatureBuf.length || !timingSafeEqual(digestBuf, signatureBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = (payload.meta as Record<string, unknown>)?.event_name as string
  const customData = (payload.meta as Record<string, unknown>)?.custom_data as Record<string, string> | undefined
  const userId = customData?.user_id
  const data = payload.data as Record<string, unknown>
  const attrs = data?.attributes as Record<string, unknown>

  // On ignore les événements sans user_id (ex: abonnements créés hors app)
  if (!userId) {
    return NextResponse.json({ ok: true })
  }

  const supabase = createAdminClient()

  if (
    eventName === 'subscription_created' ||
    eventName === 'subscription_updated' ||
    eventName === 'subscription_resumed'
  ) {
    const isActive = attrs?.status === 'active' || attrs?.status === 'on_trial'
    const endsAt = (attrs?.ends_at as string) ?? null
    const renewsAt = (attrs?.renews_at as string) ?? null

    await supabase.from('user_plans').upsert({
      user_id: userId,
      plan: isActive ? 'pro' : 'free',
      lemon_subscription_id: data?.id as string,
      lemon_customer_id: String(attrs?.customer_id ?? ''),
      plan_expires_at: endsAt ?? renewsAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (
    eventName === 'subscription_cancelled' ||
    eventName === 'subscription_expired' ||
    eventName === 'subscription_paused'
  ) {
    // Garde l'accès PRO jusqu'à ends_at (fin de la période payée)
    const endsAt = (attrs?.ends_at as string) ?? null
    const isStillActive = endsAt ? new Date(endsAt) > new Date() : false

    await supabase.from('user_plans').upsert({
      user_id: userId,
      plan: isStillActive ? 'pro' : 'free',
      lemon_subscription_id: data?.id as string,
      lemon_customer_id: String(attrs?.customer_id ?? ''),
      plan_expires_at: endsAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  return NextResponse.json({ ok: true })
}
