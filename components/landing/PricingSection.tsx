'use client'
import Image from 'next/image'
import { useReveal } from '@/lib/hooks/use-reveal'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.42)'
const BORDER = 'rgba(255,255,255,0.07)'

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

interface PricingSectionProps {
  isLoggedIn: boolean
  onSignup: () => void
}

export default function PricingSection({ isLoggedIn, onSignup }: PricingSectionProps) {
  const headerRef = useReveal()
  const freeRef = useReveal(0.1)
  const proRef = useReveal(0.1)

  return (
    <section id="pricing" style={{ padding: '100px 24px', background: '#080808', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div ref={headerRef} className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)',
            color: Y, borderRadius: 3, padding: '5px 14px',
            fontSize: 11, fontWeight: 700, marginBottom: 20,
            letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
          }}>
            Tarifs
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700,
            color: 'white', fontFamily: 'Syne, sans-serif',
            letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1,
          }}>
            Simple et transparent
          </h2>
          <p style={{ fontSize: 15, color: MUTED, fontFamily: 'Syne, sans-serif', maxWidth: 440, margin: '0 auto' }}>
            Commence gratuitement, passe en Pro quand tu veux.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>

          {/* FREE */}
          <div ref={freeRef} className="reveal reveal-d1" style={{
            background: 'rgba(255,255,255,0.025)',
            border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: '32px 28px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif', marginBottom: 8 }}>
              Gratuit
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em', lineHeight: 1 }}>
                0€
              </span>
              <span style={{ fontSize: 13, color: MUTED, fontFamily: 'Syne, sans-serif' }}>/mois</span>
            </div>
            <p style={{ fontSize: 12, color: MUTED, fontFamily: 'Syne, sans-serif', marginBottom: 28 }}>
              Pour commencer sans engagement
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
              {FREE_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: f.ok ? '#4ade80' : 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                    {f.ok ? '✓' : '✕'}
                  </span>
                  <span style={{
                    fontSize: 13, fontFamily: 'Syne, sans-serif',
                    color: f.ok ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.22)',
                    textDecoration: f.ok ? 'none' : 'line-through',
                  }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onSignup}
              style={{
                width: '100%', padding: '12px 0', fontSize: 13, fontFamily: 'Syne, sans-serif',
                fontWeight: 600, background: 'transparent', color: MUTED,
                border: `1px solid ${BORDER}`, borderRadius: 10, cursor: 'pointer',
                transition: 'color .15s, border-color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
            >
              Commencer gratuitement
            </button>
          </div>

          {/* PRO */}
          <div ref={proRef} className="reveal reveal-d2" style={{
            background: 'rgba(234,179,8,0.035)',
            border: `2px solid rgba(234,179,8,0.35)`,
            borderRadius: 20, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow */}
            <div aria-hidden style={{
              position: 'absolute', top: -80, right: -80, width: 260, height: 260,
              background: 'radial-gradient(ellipse, rgba(234,179,8,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Pro badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
              borderRadius: 20, padding: '4px 12px', marginBottom: 16,
            }}>
              <Image src="/star.png" alt="" width={16} height={16} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: Y, letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>
                Pro
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em', lineHeight: 1 }}>
                9€
              </span>
              <span style={{ fontSize: 13, color: MUTED, fontFamily: 'Syne, sans-serif' }}>/mois</span>
            </div>
            <p style={{ fontSize: 12, color: MUTED, fontFamily: 'Syne, sans-serif', marginBottom: 28 }}>
              Tout inclus · Sans engagement · Annulation en 1 clic
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: Y, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'Syne, sans-serif' }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            {isLoggedIn ? (
              <a
                href="/api/checkout"
                className="btn-yellow"
                style={{ display: 'block', width: '100%', padding: '14px 0', fontSize: 14, textAlign: 'center', textDecoration: 'none', borderRadius: 10, boxSizing: 'border-box' }}
              >
                Passer en Pro →
              </a>
            ) : (
              <button
                onClick={onSignup}
                className="btn-yellow"
                style={{ width: '100%', padding: '14px 0', fontSize: 14, borderRadius: 10 }}
              >
                Commencer - 7 jours gratuits →
              </button>
            )}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 12, textAlign: 'center', fontFamily: 'Syne, sans-serif' }}>
              Pas de carte bancaire requise pour l&apos;essai
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
