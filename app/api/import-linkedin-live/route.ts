import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { providerToken, linkedinSub } = await req.json()

  if (!providerToken || !linkedinSub) {
    return NextResponse.json({ error: 'Token ou ID LinkedIn manquant' }, { status: 400 })
  }

  // The sub from LinkedIn OIDC is either a full URN or just the person ID
  const personUrn = linkedinSub.startsWith('urn:li:person:')
    ? linkedinSub
    : `urn:li:person:${linkedinSub}`

  // Try newer REST API first
  const url = `https://api.linkedin.com/rest/posts?author=${encodeURIComponent(personUrn)}&q=author&count=10&sortBy=LAST_MODIFIED`

  let res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${providerToken}`,
      'LinkedIn-Version': '202404',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  })

  // Fallback to v2 UGC posts if REST API fails
  if (!res.ok) {
    const fallbackUrl = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodeURIComponent(personUrn)})&count=10&sortBy=LAST_MODIFIED`
    res = await fetch(fallbackUrl, {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    })
  }

  if (!res.ok) {
    const errText = await res.text()
    console.error('[import-linkedin-live] LinkedIn API error:', res.status, errText)
    if (res.status === 403) {
      return NextResponse.json({
        error: 'LinkedIn ne permet pas la lecture de posts via OAuth standard. Utilise l\'export CSV à la place.',
        csvRequired: true,
      }, { status: 403 })
    }
    if (res.status === 401) {
      return NextResponse.json({
        error: 'Session LinkedIn expirée. Déconnecte-toi et reconnecte-toi avec LinkedIn.',
      }, { status: 401 })
    }
    return NextResponse.json({ error: `Erreur LinkedIn API (${res.status})` }, { status: 400 })
  }

  const data = await res.json()
  const elements = data.elements || []

  const posts: string[] = elements
    .map((el: any) => {
      // REST API format
      if (typeof el.commentary === 'string') return el.commentary.trim()
      // UGC Posts v2 format
      const text = el?.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text
      return typeof text === 'string' ? text.trim() : ''
    })
    .filter((p: string) => p.length > 30)
    .slice(0, 3)

  return NextResponse.json({ posts })
}
