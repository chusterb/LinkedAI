'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import TransitionLink from '@/components/TransitionLink'
import { useToast } from '@/lib/toast'
import { BORDER, MUTED, Y, FONT, ActiveTab } from '@/lib/dashboard-types'

const TABS = [
  {
    id: 'editor' as ActiveTab,
    label: 'Génère ton post',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    id: 'style' as ActiveTab,
    label: 'Mon style',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    ),
  },
  {
    id: 'history' as ActiveTab,
    label: 'Historique',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

interface DashboardSidebarProps {
  loading: boolean
  isPro: boolean
  hasStyle: boolean
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  isMobile: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  email: string
  initials: string
  handleLogout: () => void
}

export default function DashboardSidebar({
  loading, isPro, hasStyle, activeTab, setActiveTab,
  isMobile, mobileMenuOpen, setMobileMenuOpen,
  email, initials, handleLogout,
}: DashboardSidebarProps) {
  const [contactPopover, setContactPopover] = useState(false)
  const [contactCopied, setContactCopied] = useState(false)
  const contactRef = useRef<HTMLButtonElement>(null)
  const { toast } = useToast()

  return (
    <aside style={isMobile ? {
      width: 260, flexShrink: 0, background: '#0b0b0b',
      borderRight: `1px solid ${BORDER}`, height: '100vh',
      position: 'fixed', top: 0, left: 0,
      display: 'flex', flexDirection: 'column', padding: '60px 0 20px', zIndex: 200,
      transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)', overflowY: 'auto',
    } : {
      width: 240, flexShrink: 0, background: '#0b0b0b',
      borderRight: `1px solid ${BORDER}`,
      height: 'calc(100vh - 60px)', position: 'sticky', top: 60,
      display: 'flex', flexDirection: 'column', padding: '20px 0', zIndex: 40,
    }}>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { if (!loading) { setActiveTab(tab.id); setMobileMenuOpen(false) } }}
              style={{
                width: '100%', padding: '10px 24px',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontFamily: FONT,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'white' : MUTED,
                background: isActive ? 'rgba(234,179,8,0.07)' : 'transparent',
                borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                borderLeft: isActive ? `2px solid ${Y}` : '2px solid transparent',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all .15s', textAlign: 'left',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Bottom section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 16px' }}>

        {/* Upgrade CTA — free users only */}
        {!loading && !isPro && (
          <a
            href="/api/checkout"
            className="btn-yellow"
            style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, textDecoration: 'none', textAlign: 'center', animation: 'fadeIn .4s ease' }}
          >
            Passer en Pro →
          </a>
        )}

        {/* Plans link — visible for all */}
        {!loading && (
          <a
            href="/dashboard/upgrade"
            style={{
              fontSize: 11, color: isPro ? Y : MUTED, textDecoration: 'none', fontFamily: FONT,
              padding: '6px 4px', display: 'flex', alignItems: 'center', gap: 6,
              borderRadius: 6, transition: 'color .15s, background .15s',
              animation: 'fadeIn .4s ease', marginBottom: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.color = isPro ? Y : MUTED; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {isPro ? 'Mon plan Pro' : 'Comparer les offres'}
          </a>
        )}

        {/* Style nudge */}
        {!loading && !hasStyle && (
          <button
            onClick={() => setActiveTab('style')}
            style={{
              fontSize: 12, color: MUTED, background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px',
              cursor: 'pointer', fontFamily: FONT, animation: 'fadeIn .4s ease',
              transition: 'color .15s, border-color .15s', marginBottom: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
          >
            ⚡ Configurer mon style
          </button>
        )}

        <div style={{ height: 1, background: BORDER, margin: '4px 0' }} />

        {/* User card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: loading ? 0.3 : 1, transition: 'opacity .3s' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: loading ? 'rgba(255,255,255,0.1)' : Y,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#000', transition: 'background .4s',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'white', fontFamily: FONT, fontWeight: 500, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email?.split('@')[0]}
              </span>
              {!loading && isPro && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#000', background: Y, borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em', flexShrink: 0 }}>
                  PRO
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: MUTED, fontFamily: FONT, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {email}
            </span>
          </div>
        </div>

        {/* Sub-actions */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, animation: 'fadeIn .4s ease' }}>
            {isPro && (
              <a
                href="/api/customer-portal"
                style={{ fontSize: 11, color: MUTED, fontFamily: FONT, textDecoration: 'none', padding: '6px 4px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6, transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = 'transparent' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Gérer mon abonnement
              </a>
            )}

            {/* Contact button */}
            <button
              ref={contactRef}
              onClick={() => setContactPopover(v => !v)}
              style={{
                fontSize: 11, color: contactPopover ? 'white' : MUTED,
                background: contactPopover ? 'rgba(255,255,255,0.04)' : 'none',
                border: 'none', padding: '6px 4px', cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                borderRadius: 6, transition: 'color .15s, background .15s', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!contactPopover) { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = 'transparent' } }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Nous contacter
            </button>

            {/* Contact popover */}
            {contactPopover && (() => {
              const rect = contactRef.current?.getBoundingClientRect()
              return (
                <>
                  <div onClick={() => setContactPopover(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
                  <div style={{
                    position: 'fixed',
                    left: (rect?.right ?? 0) + 12,
                    top: Math.min((rect?.top ?? 0) - 8, window.innerHeight - 220),
                    zIndex: 200, width: 260, background: '#131313',
                    border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 14,
                    padding: '18px 18px 14px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    animation: 'popoverIn .18s cubic-bezier(0.16,1,0.3,1) forwards',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Image src="/mail-icon.png" alt="" width={36} height={36} style={{ objectFit: 'contain', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: FONT }}>Nous contacter</div>
                        <div style={{ fontSize: 10, color: MUTED, fontFamily: FONT }}>Réponse sous 24h en semaine</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'white', fontFamily: FONT, fontWeight: 500 }}>contact@linkedai.fr</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText('contact@linkedai.fr').catch(() => {}); setContactCopied(true); toast('Email copié !', 'info'); setTimeout(() => setContactCopied(false), 2000) }}
                        style={{ fontSize: 10, color: contactCopied ? Y : MUTED, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0, flexShrink: 0, transition: 'color .15s' }}
                      >
                        {contactCopied ? '✓ Copié' : 'Copier'}
                      </button>
                    </div>
                    <a href="mailto:contact@linkedai.fr" className="btn-yellow" style={{ fontSize: 11, padding: '8px 14px', display: 'block', textAlign: 'center', textDecoration: 'none', borderRadius: 8 }}>
                      Ouvrir mon client mail →
                    </a>
                  </div>
                </>
              )
            })()}

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                fontSize: 11, color: MUTED, background: 'none', border: 'none',
                padding: '6px 4px', cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                borderRadius: 6, transition: 'color .15s, background .15s', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export { TABS }
