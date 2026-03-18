'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useReveal } from '@/lib/hooks/use-reveal'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.42)'
const BORDER = 'rgba(255,255,255,0.07)'

// ← Remplace par ton email de contact
const CONTACT_EMAIL = 'contact@linkedai.fr'

const REASONS = [
  { icon: null, img: '/computer.png', label: 'Bug ou problème technique' },
  { icon: null, img: '/loupe.png', label: 'Suggestion de fonctionnalité' },
  { icon: null, img: '/credit-card.png', label: 'Question sur la facturation' },
  { icon: null, img: '/heart.png', label: 'Partenariat ou presse' },
]

export default function ContactSection() {
  const [copied, setCopied] = useState(false)
  const ref = useReveal()

  const copy = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="contact" style={{ padding: '100px 24px', background: '#0d0d0d', borderTop: `1px solid ${BORDER}` }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)',
          color: Y, borderRadius: 3, padding: '5px 14px',
          fontSize: 11, fontWeight: 700, marginBottom: 20,
          letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
        }}>
          Contact
        </div>

        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.025em', marginBottom: 14 }}>
          On est là pour toi
        </h2>
        <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.8, marginBottom: 48, maxWidth: 480, margin: '0 auto 48px', fontFamily: 'Syne, sans-serif' }}>
          Une question, un bug, une idée ? Envoie-nous un message.
        </p>

        {/* Email card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '32px', marginBottom: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          <Image src="/mail-icon.png" alt="Email" width={72} height={72} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>
              Email
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', textDecoration: 'none', letterSpacing: '-0.01em' }}
              onMouseEnter={e => e.currentTarget.style.color = Y}
              onMouseLeave={e => e.currentTarget.style.color = 'white'}
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="btn-yellow"
              style={{ fontSize: 13, padding: '11px 28px', textDecoration: 'none' }}
            >
              Envoyer un email →
            </a>
            <button
              onClick={copy}
              style={{
                fontSize: 13, padding: '11px 24px',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
                borderRadius: 8, color: copied ? Y : MUTED,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = copied ? Y : MUTED }}
            >
              {copied ? '✓ Copié' : 'Copier l\'adresse'}
            </button>
          </div>
        </div>

        {/* Raisons de contact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 440, margin: '0 auto' }}>
          {REASONS.map(r => (
            <div key={r.label} style={{
              background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
            }}>
              {r.img
                ? <Image src={r.img} alt="" width={22} height={22} style={{ objectFit: 'contain', flexShrink: 0 }} />
                : <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
              }
              <span style={{ fontSize: 12, color: MUTED, fontFamily: 'Syne, sans-serif', lineHeight: 1.4 }}>{r.label}</span>
            </div>
          ))}
        </div>

        {/* Délai de réponse */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 32, fontFamily: 'Syne, sans-serif', letterSpacing: '0.03em' }}>
          Délai de réponse moyen : moins de 24h en semaine
        </p>
      </div>
    </section>
  )
}
