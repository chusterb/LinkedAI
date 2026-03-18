'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080808', color: 'white', fontFamily: 'Syne, sans-serif',
      flexDirection: 'column', gap: 20, padding: 24, textAlign: 'center'
    }}>
      <div style={{ fontSize: 40 }}>⚠</div>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Une erreur est survenue</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.7 }}>
        Quelque chose s'est mal passé. Réessaie ou rafraîchis la page.
      </p>
      <button
        onClick={reset}
        className="btn-yellow"
        style={{ fontSize: 14, padding: '11px 28px' }}
      >
        Réessayer
      </button>
    </div>
  )
}
