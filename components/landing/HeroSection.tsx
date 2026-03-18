'use client'
import { useState, useEffect, useRef } from 'react'
import { useCountUp } from '@/lib/hooks/use-count-up'

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.58)'

function StatItem({ n, suffix, prefix, label, isLast, active, delay }: {
  n: number; suffix: string; prefix: string; label: string
  isLast: boolean; active: boolean; delay: number
}) {
  const [go, setGo] = useState(false)
  const count = useCountUp(n, 1600, go)
  useEffect(() => {
    if (!active) return
    const id = setTimeout(() => setGo(true), delay)
    return () => clearTimeout(id)
  }, [active, delay])

  return (
    <div style={{
      padding: '22px 40px', textAlign: 'center', flex: '1 1 110px',
      borderRight: !isLast ? `1px solid ${BORDER}` : 'none',
    }}>
      <div style={{
        fontSize: 26, fontWeight: 800,
        color: go ? 'white' : MUTED,
        fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em',
        transition: 'color 0.3s',
      }}>
        {prefix}{go ? count : 0}{suffix}
      </div>
      <div style={{
        fontSize: 11, color: MUTED, marginTop: 5,
        fontFamily: 'Syne, sans-serif', letterSpacing: '0.07em',
        textTransform: 'uppercase', fontWeight: 600,
      }}>
        {label}
      </div>
    </div>
  )
}

interface HeroSectionProps {
  isLoggedIn: boolean
  onSignup: () => void
}

export default function HeroSection({ isLoggedIn, onSignup }: HeroSectionProps) {
  const [statsActive, setStatsActive] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsActive(true) },
      { threshold: 0.2 },
    )
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '140px 24px 80px', position: 'relative', overflow: 'hidden',
    }}>
      <video aria-hidden autoPlay muted loop playsInline style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0.25, zIndex: 0, pointerEvents: 'none',
      }}>
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.40) 50%, rgba(8,8,8,0.75) 85%, #080808 100%)',
      }} />

      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 220, zIndex: 2, pointerEvents: 'none',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 55%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 55%)',
      }} />

      <div aria-hidden style={{
        position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 900, height: 500, zIndex: 1,
        background: 'radial-gradient(ellipse, rgba(234,179,8,0.055) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', maxWidth: 900, position: 'relative', zIndex: 3 }}>
        <div className="animate-fadeInUp" style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 3, padding: '7px 18px', marginBottom: 44,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: Y, display: 'inline-block', animation: 'pulse 2.4s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, color: Y, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>
            IA générative · LinkedIn · 🇫🇷 Français
          </span>
        </div>

        <h1 className="animate-fadeInUp delay-1" style={{
          fontSize: 'clamp(44px, 7.5vw, 86px)', fontWeight: 700,
          color: 'white', marginBottom: 30,
          letterSpacing: '-0.025em', lineHeight: 1.05, fontFamily: 'Syne, sans-serif',
        }}>
          Tes posts LinkedIn,<br />
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <em style={{ fontStyle: 'italic', color: Y, fontFamily: 'Instrument Serif, Georgia, serif', fontWeight: 400, fontSize: '1.02em' }}>
              qui te ressemblent
            </em>
            <span className="hero-line" />
          </span>
          {' '}
          <span style={{ color: 'rgba(255,255,255,0.88)' }}>vraiment.</span>
        </h1>

        <p className="animate-fadeInUp delay-2" style={{
          fontSize: 17, color: MUTED, fontWeight: 400,
          margin: '0 auto 52px', maxWidth: 460, lineHeight: 1.8, fontFamily: 'Syne, sans-serif',
        }}>
          Donne une idée brute de ton post. L'IA génère avec ton style, pas du contenu générique.
        </p>

        <div className="animate-fadeInUp delay-3 hero-cta" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {isLoggedIn ? (
            <a href="/api/checkout" className="btn-yellow" style={{ fontSize: 14, padding: '14px 36px', textDecoration: 'none' }}>
              Passer en Pro - 9€/mois →
            </a>
          ) : (
            <button onClick={onSignup} className="btn-yellow" style={{ fontSize: 14, padding: '14px 36px' }}>
              Essayer gratuitement →
            </button>
          )}
          <a href="#demo" className="btn-ghost-dark" style={{ fontSize: 14, padding: '14px 28px' }}>
            Voir la démo ↓
          </a>
        </div>

        <div ref={statsRef} className="animate-fadeInUp delay-5 stats-block" style={{
          display: 'inline-flex', marginTop: 72,
          border: `1px solid rgba(255,255,255,0.10)`, borderRadius: 12,
          overflow: 'hidden', background: 'rgba(8,8,8,0.45)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}>
          <StatItem n={2000} prefix="" suffix="+" label="posts générés" isLast={false} active={statsActive} delay={0} />
          <StatItem n={5} prefix="< " suffix="s" label="par génération" isLast={false} active={statsActive} delay={160} />
          <StatItem n={100} prefix="" suffix="%" label="en français" isLast={false} active={statsActive} delay={320} />
          <StatItem n={9} prefix="" suffix="€/mois" label="tout inclus" isLast={true} active={statsActive} delay={480} />
        </div>
      </div>
    </section>
  )
}
