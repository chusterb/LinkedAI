'use client'

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.25)'
const LINK_STYLE: React.CSSProperties = {
  color: MUTED, textDecoration: 'none', fontFamily: 'Syne, sans-serif',
  fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase',
  transition: 'color .15s',
}

interface LandingFooterProps {
  onLogin: () => void
}

export default function LandingFooter({ onLogin }: LandingFooterProps) {
  return (
    <footer style={{
      padding: 'clamp(20px, 3vw, 32px) clamp(20px, 5vw, 48px)',
      background: '#040404',
      borderTop: `1px solid ${BORDER}`,
    }}>
      {/* Main row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16, marginBottom: 20,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' }}>
          Linked<span style={{ color: Y }}>AI</span>
        </span>

        <div style={{ display: 'flex', gap: 20, fontSize: 11, color: MUTED, fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>© 2026 LinkedAI</span>
          <span>Fait en France 🇫🇷</span>
          <button
            onClick={onLogin}
            style={{
              color: MUTED, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 11, transition: 'color .15s',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}
          >
            Connexion
          </button>
        </div>
      </div>

      {/* Legal links — full row, left aligned */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center',
        paddingTop: 16, borderTop: `1px solid rgba(255,255,255,0.04)`,
      }}>
        {[
          { href: '/mentions-legales', label: 'Mentions légales' },
          { href: '/confidentialite', label: 'Confidentialité' },
          { href: '/cgv', label: 'CGV' },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            style={LINK_STYLE}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
