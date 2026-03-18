import type { Metadata } from 'next'
import TransitionLink from '@/components/TransitionLink'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — LinkedAI',
  description: 'Conditions générales de vente du service LinkedAI.',
  robots: { index: false, follow: false },
}

const Y = '#EAB308'
const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.5)'
const FONT = 'Syne, sans-serif'

export default function CGV() {
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
          Conditions Générales de Vente
        </h1>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 48 }}>Dernière mise à jour : mars 2026</p>

        {[
          {
            title: '1. Objet',
            content: [
              'Les présentes Conditions Générales de Vente (CGV) régissent les ventes de services réalisées par LinkedAI (ci-après « le Vendeur ») au profit de tout utilisateur (ci-après « le Client ») via le site linkedai.fr.',
            ],
          },
          {
            title: '2. Services proposés',
            content: [
              'LinkedAI propose un service SaaS de génération de posts LinkedIn par intelligence artificielle, disponible sous deux formules :',
              '— Plan Gratuit : accès limité à 5 générations par jour, sans historique',
              '— Plan Pro (9€ TTC/mois) : générations illimitées, historique complet, collections, feedback IA',
            ],
          },
          {
            title: '3. Prix',
            content: [
              'Le Plan Pro est proposé au prix de 9€ TTC par mois.',
              'Les prix sont indiqués en euros toutes taxes comprises (TTC).',
              'LinkedAI se réserve le droit de modifier ses tarifs à tout moment. Tout changement sera communiqué avec un préavis d\'un mois.',
            ],
          },
          {
            title: '4. Souscription et paiement',
            content: [
              'La souscription au Plan Pro s\'effectue en ligne via le processeur de paiement sécurisé LemonSqueezy.',
              'Le paiement est effectué par carte bancaire. L\'abonnement est renouvelé automatiquement chaque mois à la date anniversaire de souscription.',
              'En souscrivant, le Client accepte expressément être débité mensuellement du montant de l\'abonnement.',
            ],
          },
          {
            title: '5. Droit de rétractation',
            content: [
              'Conformément à l\'article L.221-28 du Code de la consommation, le droit de rétractation ne s\'applique pas aux services pleinement exécutés avant la fin du délai de rétractation et dont l\'exécution a commencé après accord préalable exprès du consommateur.',
              'En validant le paiement et en accédant immédiatement au service, le Client renonce expressément à son droit de rétractation.',
            ],
          },
          {
            title: '6. Résiliation',
            content: [
              'Le Client peut résilier son abonnement à tout moment depuis son espace client (rubrique « Gérer mon abonnement »). La résiliation prend effet à la fin de la période de facturation en cours.',
              'LinkedAI se réserve le droit de résilier un abonnement en cas de violation des présentes CGV.',
            ],
          },
          {
            title: '7. Disponibilité du service',
            content: [
              'LinkedAI s\'engage à maintenir le service accessible 24h/24 et 7j/7, sauf en cas de maintenance planifiée ou de force majeure.',
              'LinkedAI ne peut garantir l\'absence d\'interruptions liées aux infrastructures tierces (hébergement, sous-traitants IA).',
            ],
          },
          {
            title: '8. Propriété intellectuelle',
            content: [
              'Les posts générés par LinkedAI à partir des inputs du Client appartiennent au Client.',
              'LinkedAI se réserve le droit d\'utiliser les données d\'usage (de façon anonymisée) pour améliorer son service.',
            ],
          },
          {
            title: '9. Responsabilité',
            content: [
              'LinkedAI est soumis à une obligation de moyens et non de résultat. Le Client est seul responsable de l\'utilisation des contenus générés par le service.',
              'LinkedAI ne saurait être tenu responsable des dommages indirects ou de la perte de revenus résultant de l\'utilisation ou de l\'impossibilité d\'utilisation du service.',
            ],
          },
          {
            title: '10. Droit applicable et juridiction',
            content: [
              'Les présentes CGV sont soumises au droit français.',
              'En cas de litige, une solution amiable sera recherchée en priorité. À défaut, le litige sera porté devant les tribunaux compétents du ressort de Paris.',
            ],
          },
          {
            title: '11. Contact',
            content: [
              'Pour toute question relative aux présentes CGV, contactez-nous à : contact@linkedai.fr',
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
          <a href="/confidentialite" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>Confidentialité</a>
        </div>
      </main>
    </div>
  )
}
