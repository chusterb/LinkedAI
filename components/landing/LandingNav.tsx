'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import TransitionLink from '@/components/TransitionLink'

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'

const NAV_LINKS: [string, string][] = [
  ['#demo', 'Démo'],
  ['#features', 'Fonctionnalités'],
  ['#pricing', 'Tarifs'],
  ['#contact', 'Contact'],
]

interface LandingNavProps {
  isLoggedIn: boolean
  scrolled: boolean
  onLogin: () => void
  onSignup: () => void
}

export default function LandingNav({ isLoggedIn, scrolled, onLogin, onSignup }: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Fermer le menu au resize vers desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 640) setMenuOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Bloquer le scroll body quand menu ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className="nav-padding" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 60,
        background: scrolled || menuOpen ? 'rgba(8,8,8,0.97)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled || menuOpen ? BORDER : 'transparent'}`,
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="" width={40} height={40} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' }}>
            Linked<span style={{ color: Y }}>AI</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div className="nav-links">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </div>
          {isLoggedIn ? (
            <TransitionLink href="/dashboard">
              <button className="btn-yellow" style={{ fontSize: 12, padding: '8px 18px' }}>Mon espace →</button>
            </TransitionLink>
          ) : (
            <>
              <button onClick={onLogin} className="btn-ghost-dark" style={{ fontSize: 12, padding: '8px 16px', marginLeft: 4 }}>Connexion</button>
              <button onClick={onSignup} className="btn-yellow" style={{ fontSize: 12, padding: '8px 16px', marginLeft: 4 }}>Commencer →</button>
            </>
          )}

          {/* Hamburger button — mobile only */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            style={{
              display: 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', marginLeft: 8,
              flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5,
            }}
          >
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2, background: 'white',
              transition: 'transform 0.25s, opacity 0.25s',
              transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2, background: 'white',
              transition: 'opacity 0.25s',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2, background: 'white',
              transition: 'transform 0.25s, opacity 0.25s',
              transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(8,8,8,0.97)',
            display: 'flex', flexDirection: 'column',
            paddingTop: 80, paddingLeft: 24, paddingRight: 24, paddingBottom: 40,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                style={{
                  fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                  fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em',
                  padding: '16px 0',
                  borderBottom: `1px solid ${BORDER}`,
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              >
                {label}
              </a>
            ))}
          </nav>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isLoggedIn ? (
              <TransitionLink href="/dashboard">
                <button onClick={closeMenu} className="btn-yellow" style={{ fontSize: 15, padding: '14px 0', width: '100%' }}>
                  Mon espace →
                </button>
              </TransitionLink>
            ) : (
              <>
                <button
                  onClick={() => { closeMenu(); onSignup() }}
                  className="btn-yellow"
                  style={{ fontSize: 15, padding: '14px 0', width: '100%' }}
                >
                  Commencer gratuitement →
                </button>
                <button
                  onClick={() => { closeMenu(); onLogin() }}
                  className="btn-ghost-dark"
                  style={{ fontSize: 14, padding: '12px 0', width: '100%', textAlign: 'center' }}
                >
                  Connexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
