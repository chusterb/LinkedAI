import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase-server'
import { FREE_DAILY_LIMIT } from '@/lib/plans'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TONE_INSTRUCTIONS: Record<string, string> = {
  storytelling: `Format : storytelling. Commence par une situation concrète ou une anecdote personnelle. Développe avec une leçon apprise. Termine par une question ou un enseignement actionnable.`,
  conseil: `Format : conseil direct. Va droit au but. Partage un conseil concret et actionnable. Utilise des phrases courtes et percutantes.`,
  opinion: `Format : prise de position. Commence par une affirmation forte ou contre-intuitive. Défends ce point de vue avec des arguments concrets. Provoque la réflexion.`,
  liste: `Format : liste pratique. Structure en points numérotés ou bullet points. Chaque point doit être court et actionnable. Ajoute un contexte en intro et une conclusion.`,
}

function buildProfileContext(profile: Record<string, string>): string {
  const lines: string[] = []

  if (profile.who?.trim())
    lines.push(`- Qui il est : ${profile.who.trim()}`)
  if (profile.audience?.trim())
    lines.push(`- Audience cible : ${profile.audience.trim()}`)
  if (profile.style?.trim())
    lines.push(`- Style de communication : ${profile.style.trim()}`)
  if (profile.formality?.trim())
    lines.push(`- Niveau de formalité : ${profile.formality.trim()}`)
  if (profile.topics?.trim())
    lines.push(`- Sujets de prédilection : ${profile.topics.trim()}`)
  if (profile.avoid?.trim())
    lines.push(`- À ÉVITER absolument : ${profile.avoid.trim()}`)
  if (profile.goal?.trim())
    lines.push(`- Objectif LinkedIn : ${profile.goal.trim()}`)

  if (lines.length === 0) return ''

  return `PROFIL DE L'AUTEUR — tiens-en compte pour personnaliser le post :\n${lines.join('\n')}\n\n`
}

const MAX_IDEA_LENGTH = 500
const DEMO_MAX_REQUESTS_PER_IP = 3

// In-memory demo rate limit (resets on server restart — sufficient for demo abuse prevention)
const demoIpCounts = new Map<string, { count: number; resetAt: number }>()

function getDemoIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      idea,
      tone = 'storytelling',
      stylePosts = [],
      styleProfile,
      demo = false,
    } = body

    if (!idea?.trim()) {
      return NextResponse.json({ error: 'Idée manquante' }, { status: 400 })
    }

    if (idea.trim().length > MAX_IDEA_LENGTH) {
      return NextResponse.json({ error: `L'idée ne peut pas dépasser ${MAX_IDEA_LENGTH} caractères` }, { status: 400 })
    }

    // Will be set for authenticated users; used to log after successful generation
    let logSupabase: ReturnType<typeof createClient> | null = null
    let logUserId: string | null = null

    if (demo) {
      // Rate-limit demo by IP — 3 requests per hour
      const ip = getDemoIp(req)
      const now = Date.now()
      const entry = demoIpCounts.get(ip)
      if (!entry || entry.resetAt < now) {
        demoIpCounts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
      } else {
        entry.count++
        if (entry.count > DEMO_MAX_REQUESTS_PER_IP) {
          return NextResponse.json({ error: 'Limite de démo atteinte. Crée un compte pour continuer.' }, { status: 429 })
        }
      }
    } else {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      // Vérifier le plan de l'utilisateur
      const { data: planData } = await supabase
        .from('user_plans')
        .select('plan, plan_expires_at')
        .eq('user_id', user.id)
        .single()

      const isPro = planData?.plan === 'pro' &&
        (!planData.plan_expires_at || new Date(planData.plan_expires_at) > new Date())

      // Appliquer la limite quotidienne pour les users free (vérification + insert atomiques)
      if (!isPro) {
        const { data: allowed, error: rpcError } = await supabase.rpc('check_and_log_generation', {
          p_user_id: user.id,
          p_daily_limit: FREE_DAILY_LIMIT,
        })
        if (rpcError) {
          console.error('[generate] check_and_log_generation error:', rpcError)
          return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
        }
        if (!allowed) {
          return NextResponse.json(
            { error: `Limite quotidienne atteinte (${FREE_DAILY_LIMIT}/jour). Passe en Pro pour des générations illimitées.`, upgrade: true },
            { status: 429 }
          )
        }
        // Log already inserted atomically by the RPC — no deferred insert needed
      } else {
        // Pro users: defer log to after successful generation
        logSupabase = supabase
        logUserId = user.id
      }
    }

    const profileContext =
      styleProfile && Object.keys(styleProfile).length > 0
        ? buildProfileContext(styleProfile)
        : ''

    const hasStyle = stylePosts.length > 0
    const styleContext = hasStyle
      ? `Voici des exemples de posts écrits par cet utilisateur. Analyse attentivement son style, son ton, son niveau de langage, ses expressions, et la façon dont il structure ses idées :\n\n${stylePosts.map((p: string, i: number) => `--- Post ${i + 1} ---\n${p}`).join('\n\n')}\n\n`
      : ''

    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.storytelling

    const systemPrompt = `Tu es un expert en copywriting LinkedIn francophone. Tu rédiges des posts qui engagent vraiment, sans tomber dans le contenu générique ou corporate.

${profileContext}${styleContext}RÈGLES ABSOLUES :
- Rédige UNIQUEMENT en français
- ${hasStyle ? 'Reproduis fidèlement le style des exemples ci-dessus' : 'Adopte un ton authentique, humain, professionnel sans être guindé'}
- ${toneInstruction}
- Hook puissant en première ligne (qui donne envie de lire la suite)
- Maximum 1300 caractères au total
- Termine par une question engageante OU un call-to-action subtil
- Pas de hashtags (l'utilisateur les ajoutera lui-même)
- Rédige directement le post, sans introduction ni commentaire`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Rédige un post LinkedIn sur cette idée : "${idea}"` }
      ],
      temperature: 0.78,
      max_tokens: 600,
    })

    const post = completion.choices[0]?.message?.content?.trim() || ''

    // Log only after successful generation so failed calls don't consume credits
    if (logSupabase && logUserId) {
      await logSupabase.from('generation_logs').insert({ user_id: logUserId })
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Groq error:', error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}
