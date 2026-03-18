import type { Metadata } from 'next'
import TransitionLink from '@/components/TransitionLink'

export const metadata: Metadata = {
  title: 'Mentions légales — LinkedAI',
  description: 'Mentions légales du service LinkedAI.',
  robots: { index: false, follow: false },
}

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.5)'
const FONT = 'Syne, sans-serif'

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: FONT }}>

      {/* Header */}
      <header style={{
        height: 60, display: 'flex', alignItems: 'center',
        padding: '0 clamp(20px, 5vw, 48px)',
        background: '#0b0b0b', borderBottom: `1px solid ${BORDER}`,
      }}>
        <TransitionLink href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'white', cursor: 'pointer' }}>
            Linked<span style={{ color: Y }}>AI</span>
          </span>
        </TransitionLink>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 48px)' }}>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.025em' }}>
          Mentions légales
        </h1>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 48 }}>Dernière mise à jour : mars 2026</p>

        {[
          {
            title: '1. Éditeur du site',
            content: [
              'Le site linkedai.fr est édité par une entreprise individuelle ou société en cours de création.',
              'Responsable de la publication : l\'équipe LinkedAI',
              'Contact : contact@linkedai.fr',
            ],
          },
          {
            title: '2. Hébergement',
            content: [
              'Le site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.',
              'Site : vercel.com',
            ],
          },
          {
            title: '3. Propriété intellectuelle',
            content: [
              'L\'ensemble des contenus présents sur le site LinkedAI (textes, images, logos, interface) est protégé par le droit de la propriété intellectuelle.',
              'Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie de ces contenus est interdite.',
            ],
          },
          {
            title: '4. Données personnelles',
            content: [
              'LinkedAI collecte et traite des données personnelles dans le cadre de la fourniture du service. Pour en savoir plus, consultez notre politique de confidentialité.',
            ],
          },
          {
            title: '5. Cookies',
            content: [
              'Le site peut utiliser des cookies techniques nécessaires au bon fonctionnement du service. Aucun cookie publicitaire n\'est déposé sans votre consentement.',
            ],
          },
          {
            title: '6. Droit applicable',
            content: [
              'Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront compétents.',
            ],
          },
        ].map(section => (
          <section key={section.title} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: Y, marginBottom: 12, letterSpacing: '-0.01em' }}>
              {section.title}
            </h2>
            {section.content.map((text, i) => (
              <p key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 8, fontFamily: FONT }}>
                {text}
              </p>
            ))}
          </section>
        ))}

        {/* Back link */}
        <div style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 24 }}>
          <TransitionLink href="/" style={{ fontSize: 13, color: MUTED, textDecoration: 'none', transition: 'color .15s' }}>
            ← Retour à l&apos;accueil
          </TransitionLink>
          <a href="/confidentialite" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>Confidentialité</a>
          <a href="/cgv" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>CGV</a>
        </div>
      </main>
    </div>
  )
}
