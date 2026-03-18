'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface FlipCardProps {
  icon: React.ReactNode
  title: string
  desc: string
  backTitle: string
  backContent: { label: string; text: string }[]
  backCta?: string
  index?: number
  floatingNode?: React.ReactNode
}

const Y = '#EAB308'

const MODAL_STYLES = `
  @keyframes fc-backdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fc-modal-in {
    0%   { transform: scale(0.94) translateY(20px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes fc-modal-out {
    from { transform: scale(1) translateY(0); opacity: 1; }
    to   { transform: scale(0.92) translateY(14px); opacity: 0; }
  }
  @keyframes fc-icon-pop {
    0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
    65%  { transform: scale(1.18) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes fc-block-in {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fc-cta-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fc-close-in {
    from { transform: rotate(-90deg) scale(0); opacity: 0; }
    to   { transform: rotate(0deg) scale(1); opacity: 1; }
  }
`

export default function FlipCard({
  icon, title, desc, backTitle, backContent, backCta, index = 0, floatingNode,
}: FlipCardProps) {
  const [open,    setOpen]    = useState(false)
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [seen,    setSeen]    = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  // Entrance animation on scroll
  useEffect(() => {
    setMounted(true)
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSeen(true); obs.disconnect() } },
      { threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const openModal  = () => { setClosing(false); setOpen(true) }
  const closeModal = () => { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false) }, 240) }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [open])

  const staggerDelay = index * 90 // ms

  const modal = open && mounted ? createPortal(
    <>
      <style>{MODAL_STYLES}</style>
      <div
        onClick={closeModal}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          background: 'rgba(4,4,4,0.75)',
          backdropFilter: 'blur(12px)',
          animation: closing ? 'fc-backdrop .22s ease forwards reverse' : 'fc-backdrop .3s ease forwards',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(160deg, #111110 0%, #0c0c0b 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderTop: `2px solid ${Y}`,
            borderRadius: 18,
            padding: '32px 28px',
            maxWidth: 480, width: '100%',
            animation: closing
              ? 'fc-modal-out .2s cubic-bezier(0.4, 0, 1, 1) forwards'
              : 'fc-modal-in .32s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            transformOrigin: 'center bottom',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
            <div>
              <div style={{
                marginBottom: 10, display: 'inline-block', lineHeight: 0,
                animation: closing ? 'none' : 'fc-icon-pop .42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both',
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1.35, margin: 0, fontFamily: 'Syne, sans-serif' }}>
                {backTitle}
              </h3>
            </div>
            <button
              onClick={closeModal}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.45)',
                borderRadius: '50%', width: 32, height: 32,
                cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background .15s, color .15s, transform .2s',
                animation: closing ? 'none' : 'fc-close-in .32s cubic-bezier(0.34, 1.56, 0.64, 1) 0.06s both',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(234,179,8,0.12)'; e.currentTarget.style.color = Y; e.currentTarget.style.transform = 'rotate(90deg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.transform = 'rotate(0)' }}
            >
              ×
            </button>
          </div>

          {/* Yellow divider */}
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, rgba(234,179,8,0.5), rgba(255,255,255,0.04) 75%)`,
            marginBottom: 24,
            animation: closing ? 'none' : 'fc-cta-in .28s ease 0.14s both',
          }} />

          {/* Content blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {backContent.map((item, i) => (
              <div
                key={i}
                style={{
                  borderLeft: `2px solid rgba(234,179,8,0.45)`,
                  paddingLeft: 14,
                  animation: closing ? 'none' : `fc-block-in .32s ease ${0.16 + i * 0.07}s both`,
                }}
              >
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.09em',
                  color: Y, marginBottom: 5, fontFamily: 'Syne, sans-serif',
                }}>
                  {item.label}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, margin: 0, fontFamily: 'Syne, sans-serif' }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {backCta && (
            <div style={{
              marginTop: 24, paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.07)',
              fontSize: 12, color: Y, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Syne, sans-serif', letterSpacing: '0.01em',
              animation: closing ? 'none' : `fc-cta-in .32s ease ${0.18 + backContent.length * 0.07}s both`,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {backCta.replace('→ ', '')}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  ) : null

  return (
    <>
      <div
        ref={cardRef}
        onClick={openModal}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          /* Entrance */
          opacity: seen ? 1 : 0,
          transform: seen
            ? 'translateY(0) scale(1)'
            : 'translateY(30px) scale(0.97)',
          transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${staggerDelay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${staggerDelay}ms, background 0.22s, border-color 0.22s, box-shadow 0.22s`,

          /* Card base */
          position: 'relative',
          background: hovered ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? 'rgba(234,179,8,0.28)' : 'rgba(255,255,255,0.07)'}`,
          borderTop: `2px solid ${hovered ? Y : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 14,
          padding: '28px 24px',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          userSelect: 'none',
          boxShadow: hovered
            ? '0 24px 56px rgba(0,0,0,0.45), 0 0 0 0 rgba(234,179,8,0)'
            : '0 0 0 rgba(0,0,0,0)',
          transformStyle: 'preserve-3d',
        }}
      >
        {floatingNode}
        {/* Icon */}
        <div style={{
          marginBottom: 18, display: 'inline-block', lineHeight: 0,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)',
          transformOrigin: 'left center',
        }}>
          {icon}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontWeight: 600, marginBottom: 10,
          color: hovered ? 'white' : 'rgba(255,255,255,0.92)',
          fontFamily: 'Syne, sans-serif', lineHeight: 1.35,
          transition: 'color 0.2s',
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75,
          fontFamily: 'Syne, sans-serif', flex: 1,
        }}>
          {desc}
        </p>

        {/* Footer hint */}
        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: `1px solid ${hovered ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.06)'}`,
          fontSize: 12, color: hovered ? Y : 'rgba(234,179,8,0.55)',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.04em',
          transition: 'color 0.2s, border-color 0.2s',
        }}>
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            style={{
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: hovered ? 'translateX(3px)' : 'translateX(0)',
            }}
          >
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          En savoir plus
        </div>
      </div>

      {modal}
    </>
  )
}
