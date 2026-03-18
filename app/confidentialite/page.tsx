import type { Metadata } from 'next'
import TransitionLink from '@/components/TransitionLink'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — LinkedAI',
  description: 'Politique de confidentialité et traitement des données personnelles de LinkedAI.',
  robots: { index: false, follow: false },
}

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.5)'
const FONT = 'Syne, sans-serif'

export default function Confidentialite() {
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
          Politique de confidentialité
        </h1>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 48 }}>Dernière mise à jour : mars 2026</p>

        {[
          {
            title: '1. Responsable du traitement',
            content: [
              'LinkedAI (contact@linkedai.fr) est responsable du traitement de vos données personnelles.',
            ],
          },
          {
            title: '2. Données collectées',
            content: [
              'Lors de votre inscription et utilisation du service, nous collectons :',
              '— Adresse e-mail (identification et communication)',
              '— Posts LinkedIn de référence que vous saisissez (pour entraîner votre style IA)',
              '— Posts générés et votre historique de génération (fonctionnalité Pro)',
              '— Données de connexion et logs techniques',
            ],
          },
          {
            title: '3. Finalités du traitement',
            content: [
              'Vos données sont utilisées pour :',
              '— Fournir le service de génération de posts LinkedIn personnalisés',
              '— Gérer votre compte et votre abonnement',
              '— Améliorer la qualité du service',
              '— Vous envoyer des communications liées au service (non optionnel)',
            ],
          },
          {
            title: '4. Base légale',
            content: [
              'Le traitement de vos données repose sur l\'exécution du contrat (CGV) vous liant à LinkedAI lors de votre inscription.',
            ],
          },
          {
            title: '5. Sous-traitants',
            content: [
              'LinkedAI utilise des sous-traitants pour opérer le service :',
              '— Supabase (stockage des données, authentification) — UE/USA',
              '— Groq (traitement IA des demandes de génération) — USA',
              '— Vercel (hébergement) — USA',
              '— LemonSqueezy (gestion des paiements) — USA',
              'Ces prestataires sont soumis à des obligations contractuelles strictes concernant la protection de vos données.',
            ],
          },
          {
            title: '6. Durée de conservation',
            content: [
              'Vos données sont conservées pendant toute la durée de votre utilisation du service, puis supprimées dans un délai de 3 ans après votre dernière connexion, sauf obligation légale contraire.',
            ],
          },
          {
            title: '7. Vos droits (RGPD)',
            content: [
              'Conformément au RGPD, vous disposez des droits suivants :',
              '— Droit d\'accès à vos données personnelles',
              '— Droit de rectification',
              '— Droit à l\'effacement (« droit à l\'oubli »)',
              '— Droit à la portabilité de vos données',
              '— Droit d\'opposition au traitement',
              'Pour exercer ces droits, contactez-nous à : contact@linkedai.fr',
              'Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).',
            ],
          },
          {
            title: '8. Cookies',
            content: [
              'LinkedAI utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service (session d\'authentification). Aucun cookie publicitaire ou de tracking tiers n\'est déposé.',
            ],
          },
          {
            title: '9. Transferts hors UE',
            content: [
              'Certains de nos sous-traitants sont établis aux États-Unis. Ces transferts sont encadrés par des clauses contractuelles types (CCT) conformes au RGPD.',
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
        <div style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <TransitionLink href="/" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </TransitionLink>
          <a href="/mentions-legales" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>Mentions légales</a>
          <a href="/cgv" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>CGV</a>
        </div>
      </main>
    </div>
  )
}
