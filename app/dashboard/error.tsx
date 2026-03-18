'use client'

export default function DashboardError({
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
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Erreur du tableau de bord</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.7 }}>
        Impossible de charger le tableau de bord. Vérifie ta connexion et réessaie.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          className="btn-yellow"
          style={{ fontSize: 14, padding: '11px 28px' }}
        >
          Réessayer
        </button>
        <a
          href="/"
          className="btn-ghost"
          style={{ fontSize: 14, padding: '11px 28px' }}
        >
          Accueil
        </a>
      </div>
    </div>
  )
}
