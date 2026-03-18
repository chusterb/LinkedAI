import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/?auth_error=1', req.url))
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID

  if (!apiKey || !storeId || !variantId) {
    console.error('LemonSqueezy env vars missing')
    return NextResponse.redirect(new URL('/dashboard?checkout_error=1', req.url))
  }

  const origin = new URL(req.url).origin

  try {
    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              custom: { user_id: user.id },
            },
            product_options: {
              redirect_url: `${origin}/dashboard?upgraded=1`,
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    })

    const data = await res.json()
    const checkoutUrl = data?.data?.attributes?.url

    if (!checkoutUrl) {
      console.error('LemonSqueezy checkout error:', JSON.stringify(data))
      return NextResponse.redirect(new URL('/dashboard?checkout_error=1', req.url))
    }

    return NextResponse.redirect(checkoutUrl)
  } catch (error) {
    console.error('Checkout fetch error:', error)
    return NextResponse.redirect(new URL('/dashboard?checkout_error=1', req.url))
  }
}
