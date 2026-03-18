'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import TransitionLink from '@/components/TransitionLink'

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.42)'
const FONT = 'Syne, sans-serif'

const FREE_FEATURES = [
  { label: '3 générations par jour', ok: true },
  { label: '4 formats de posts', ok: true },
  { label: 'Style IA personnalisé', ok: true },
  { label: 'Import depuis LinkedIn (CSV)', ok: true },
  { label: '3 variantes par idée', ok: false },
  { label: 'Historique des posts', ok: false },
  { label: 'Vote 👍👎 pour affiner l\'IA', ok: false },
  { label: 'Collections & organisation', ok: false },
  { label: 'Export CSV & recherche', ok: false },
]

const PRO_FEATURES = [
  { label: 'Générations illimitées', ok: true },
  { label: '3 variantes par idée — compare et choisis', ok: true },
  { label: '4 formats de posts', ok: true },
  { label: 'Style IA personnalisé', ok: true },
  { label: 'Import depuis LinkedIn (CSV)', ok: true },
  { label: 'Historique complet des posts', ok: true },
  { label: 'Vote 👍👎 pour affiner l\'IA', ok: true },
  { label: 'Collections & organisation', ok: true },
  { label: 'Export CSV & recherche dans l\'historique', ok: true },
]

const FAQ = [
  {
    q: 'Est-ce que je peux annuler à tout moment ?',
    a: 'Oui, tu peux annuler depuis ton espace client à n\'importe quel moment. L\'accès Pro reste actif jusqu\'à la fin de la période déjà payée.',
  },
  {
    q: 'Y a-t-il un engagement minimum ?',
    a: 'Non. L\'abonnement est mensuel et sans engagement. Tu paies mois par mois.',
  },
  {
    q: 'Mes données de style sont-elles conservées si je reviens en Free ?',
    a: 'Oui. Ton style configuré reste intact quel que soit ton plan. Seuls l\'historique et les fonctionnalités avancées sont réservés au Pro.',
  },
  {
    q: 'Comment fonctionne le paiement ?',
    a: 'Le paiement est sécurisé via LemonSqueezy (Stripe). Tu es débité de 9€ TTC chaque mois à la date anniversaire de ton abonnement.',
  },
]

export default function UpgradePage() {
  const [isPro, setIsPro] = useState<boolean | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('user_plans').select('plan, plan_expires_at').eq('user_id', user.id).single()
      const pro = data?.plan === 'pro' && (!data.plan_expires_at || new Date(data.plan_expires_at) > new Date())
      setIsPro(pro)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: FONT }}>

      {/* Header */}
      <header style={{
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 48px)',
        background: '#0b0b0b', borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <TransitionLink href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: MUTED }}>
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span style={{ fontSize: 13, color: MUTED }}>Dashboard</span>
        </TransitionLink>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Linked<span style={{ color: Y }}>AI</span>
        </span>
        <div style={{ width: 80 }} />
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) 24px 40px', maxWidth: 640, margin: '0 auto' }}>
        {isPro ? (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <Image src="/star.png" alt="" width={48} height={48} style={{ objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 700, marginBottom: 12, letterSpacing: '-0.025em' }}>
              Tu es déjà Pro !
            </h1>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 28 }}>
              Tu as accès à toutes les fonctionnalités. Gère ton abonnement depuis ton espace client.
            </p>
            <a href="/api/customer-portal" className="btn-yellow" style={{ fontSize: 14, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }}>
              Gérer mon abonnement →
            </a>
          </>
        ) : (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)',
              borderRadius: 3, padding: '6px 16px', marginBottom: 24,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: Y, display: 'inline-block', animation: 'pulse 2.4s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                Plan Pro
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, marginBottom: 14, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Passe à la vitesse supérieure
            </h1>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7, marginBottom: 0 }}>
              Générations illimitées, variantes pour comparer 3 versions d'un même post, historique complet, et tous les outils pour affiner ton style IA.
            </p>
          </>
        )}
      </div>

      {/* Comparison table */}
      {!isPro && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Free */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`,
              borderRadius: 16, padding: 'clamp(20px, 3vw, 28px)',
            }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Gratuit
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>0€</span>
                  <span style={{ fontSize: 13, color: MUTED }}>/mois</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {FREE_FEATURES.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, color: f.ok ? '#4ade80' : 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                      {f.ok ? '✓' : '✕'}
                    </span>
                    <span style={{ fontSize: 13, color: f.ok ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', textDecoration: f.ok ? 'none' : 'line-through' }}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                fontSize: 13, color: MUTED, textAlign: 'center',
                padding: '10px 0', border: `1px solid ${BORDER}`, borderRadius: 8,
              }}>
                Plan actuel
              </div>
            </div>

            {/* Pro */}
            <div style={{
              background: 'rgba(234,179,8,0.04)',
              border: `2px solid rgba(234,179,8,0.35)`,
              borderRadius: 16, padding: 'clamp(20px, 3vw, 28px)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow */}
              <div aria-hidden style={{
                position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                background: 'radial-gradient(ellipse, rgba(234,179,8,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: Y, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Pro ✦
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>9€</span>
                  <span style={{ fontSize: 13, color: MUTED }}>/mois</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, color: Y, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>{f.label}</span>
                  </div>
                ))}
              </div>
              <a
                href="/api/checkout"
                className="btn-yellow"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: 14, padding: '12px 0', borderRadius: 8 }}
              >
                Passer en Pro →
              </a>
              <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>
                7 jours gratuits · Sans engagement · Annule à tout moment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) 80px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em' }}>
          Questions fréquentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{
                background: openFaq === i ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${openFaq === i ? 'rgba(255,255,255,0.12)' : BORDER}`,
                borderRadius: 10, overflow: 'hidden', transition: 'border-color .15s',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', padding: '14px 18px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: FONT, fontSize: 14, color: 'white',
                  fontWeight: openFaq === i ? 600 : 400, textAlign: 'left',
                }}
              >
                <span>{item.q}</span>
                <span style={{
                  fontSize: 18, color: MUTED, flexShrink: 0,
                  transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform .2s',
                }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{
                  padding: '0 18px 14px',
                  fontSize: 13, color: MUTED, lineHeight: 1.7,
                  animation: 'fadeIn .15s ease',
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final CTA */}
        {!isPro && (
          <div style={{
            marginTop: 40, textAlign: 'center',
            padding: '32px 24px',
            background: 'rgba(234,179,8,0.04)', border: `1px solid rgba(234,179,8,0.2)`,
            borderRadius: 16,
          }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 1.6 }}>
              Prêt à générer sans limite ?<br />
              <span style={{ color: MUTED, fontSize: 13 }}>9€/mois · Sans engagement · Annule quand tu veux</span>
            </p>
            <a href="/api/checkout" className="btn-yellow" style={{ fontSize: 14, padding: '13px 36px', textDecoration: 'none', display: 'inline-block' }}>
              Passer en Pro maintenant →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
