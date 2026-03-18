'use client'
import { useState } from 'react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  todayCount: number
  dailyLimit: number
}

export default function UpgradeModal({ open, onClose, todayCount, dailyLimit }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = () => {
    setLoading(true)
    window.location.href = '/api/checkout'
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(10,10,10,0.65)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        background: '#111111',
        borderRadius: 20,
        padding: '36px 32px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        animation: 'upgradeSlideUp .3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>♾️</div>
          <h2 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 22, color: 'white', marginBottom: 10, lineHeight: 1.3
          }}>
            Limite quotidienne atteinte
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Tu as utilisé tes <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{todayCount}/{dailyLimit} générations</strong> d'aujourd'hui.
            Passe en Pro pour générer autant que tu veux.
          </p>
        </div>

        {/* Features */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '16px 18px', marginBottom: 24,
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Générations illimitées chaque jour',
              '3 variantes en parallèle à comparer',
              'Style IA personnalisé sur ta voix',
              'Historique complet avec notes 👍/👎',
              'Accès à toutes les futures fonctionnalités',
            ].map(item => (
              <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="btn-yellow"
          style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 600 }}
        >
          {loading ? 'Redirection...' : 'Passer en Pro — 9€/mois →'}
        </button>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 10 }}>
          7 jours gratuits · Sans engagement · Annulation en 1 clic
        </p>
      </div>

      <style>{`
        @keyframes upgradeSlideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  )
}
