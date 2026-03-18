import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Webhook Supabase — Email de bienvenue après `user_created`
 *
 * Configuration Supabase :
 * 1. Dashboard → Database → Webhooks → Create a new hook
 * 2. Table: auth.users / Event: INSERT
 * 3. URL: https://www.linkedai.fr/api/webhooks/welcome-email
 * 4. Add header: x-webhook-secret: [ta valeur SUPABASE_WEBHOOK_SECRET]
 *
 * Variables d'env nécessaires :
 * - SUPABASE_WEBHOOK_SECRET    → secret partagé pour vérifier la signature
 * - RESEND_API_KEY             → clé API Resend (https://resend.com)
 * - RESEND_FROM_EMAIL          → ex: "LinkedAI <noreply@linkedai.fr>"
 *
 * Pour activer Resend : npm install resend
 */

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Vérification de la signature
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  const signature = req.headers.get('x-webhook-secret')

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    const expectedBuf = Buffer.from(expected)
    const signatureBuf = Buffer.from(signature)
    if (expectedBuf.length !== signatureBuf.length || !timingSafeEqual(expectedBuf, signatureBuf)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Signature check failed' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const record = payload.record as Record<string, unknown> | undefined
  const email = record?.email as string | undefined

  if (!email) {
    return NextResponse.json({ ok: true, skipped: 'no email' })
  }

  // ── Envoi via Resend ──────────────────────────────────────────────────────
  // Décommente et installe `resend` (npm install resend) pour activer :
  //
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: process.env.RESEND_FROM_EMAIL ?? 'LinkedAI <noreply@linkedai.fr>',
  //   to: email,
  //   subject: '✦ Bienvenue sur LinkedAI — ton compte est prêt',
  //   html: welcomeEmailHtml(email),
  // })
  // ─────────────────────────────────────────────────────────────────────────

  // Pour l'instant : log en dev, intégrer l'envoi ci-dessus en production
  console.log(`[welcome-email] New user: ${email}`)

  return NextResponse.json({ ok: true })
}

// Template inline (alternative à email-templates/welcome.html pour le webhook)
// Décommenter lors de l'activation de Resend
function _welcomeEmailHtml(email: string): string {
  const firstName = email.split('@')[0].split('.')[0]
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><title>Bienvenue sur LinkedAI</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td align="center" style="padding-bottom:24px;">
  <span style="font-size:22px;font-weight:700;color:#111;letter-spacing:-0.02em;">Linked<span style="color:#EAB308;">AI</span></span>
</td></tr>
<tr><td style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
  <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111;text-align:center;">Bienvenue, ${name} ! ✦</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;text-align:center;">
    Ton compte LinkedAI est prêt. Génère des posts LinkedIn dans ta vraie voix en moins de 5 secondes.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:24px;">
    <a href="https://www.linkedai.fr/dashboard"
       style="display:inline-block;background:#EAB308;color:#000;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;">
      Accéder à mon dashboard →
    </a>
  </td></tr></table>
  <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">© 2026 LinkedAI — contact@linkedai.fr</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
