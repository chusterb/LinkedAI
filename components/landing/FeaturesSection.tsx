'use client'
import Image from 'next/image'
import { useReveal } from '@/lib/hooks/use-reveal'
import FlipCard from '@/components/FlipCard'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.42)'
const BORDER = 'rgba(255,255,255,0.07)'

const FEATURES = [
  {
    src: '/pin.png', alt: 'Pin', rotate: '-12deg',
    title: "Ta plume, pas celle d'un robot",
    desc: "Colle 3 de tes anciens posts. L'IA analyse ton style, ton vocabulaire, ta façon de structurer - et le reproduit fidèlement.",
    backTitle: "Comment l'IA apprend ton style ?",
    backContent: [
      { label: 'Analyse', text: "L'IA extrait ta longueur de phrase moyenne, ton vocabulaire récurrent, ton usage des emojis, et ta structure narrative." },
      { label: 'Profil de style', text: "Un profil unique est injecté dans chaque génération. Le résultat sonne comme toi, pas comme ChatGPT." },
      { label: 'Mise à jour', text: 'Tu peux enrichir ton style à tout moment en ajoutant de nouveaux posts dans "Mon style".' },
    ],
    backCta: '→ Configure dans Mon espace',
  },
  {
    src: '/lightning.png', alt: 'Éclair', rotate: '0deg',
    title: 'Généré en < 5 secondes',
    desc: 'Propulsé par Groq et llama-3.3-70b, le moteur le plus rapide du marché. Zéro attente.',
    backTitle: 'Pourquoi c\'est aussi rapide ?',
    backContent: [
      { label: 'Technologie', text: "Groq utilise des puces LPU dédiées - 10× plus rapides que les GPU classiques d'OpenAI." },
      { label: 'Modèle', text: 'llama-3.3-70b : 70 milliards de paramètres, excellent en français, ~500 tokens/seconde.' },
      { label: 'vs GPT-4', text: 'Un post complet arrive en 2-5s. GPT-4 prendrait 20-40 secondes pour le même résultat.' },
    ],
    backCta: '→ Essaie la démo ci-dessus',
  },
  {
    src: '/location.png', alt: 'Localisation', rotate: '0deg',
    title: '100% conçu pour le FR',
    desc: "Pas une traduction d'outil américain. Prompt, formats, ton - tout est pensé pour le LinkedIn francophone.",
    backTitle: 'La différence avec les outils US ?',
    backContent: [
      { label: 'Codes culturels', text: 'Le LinkedIn FR a ses propres codes : moins de self-promo agressive, plus de storytelling humain.' },
      { label: 'Langue native', text: 'Les prompts sont rédigés directement en français - pas traduits. Zéro perte de nuance.' },
      { label: 'Formats adaptés', text: 'Calibrés sur les posts FR qui performent le mieux, pas sur des templates anglais recyclés.' },
    ],
  },
  {
    src: '/pencil.png', alt: 'Crayon', rotate: '298deg',
    title: 'Variantes & édition · Pro',
    desc: 'Génère 3 versions du même post en parallèle, compare, choisis la meilleure. Puis édite directement.',
    backTitle: 'Comment fonctionnent les variantes ?',
    backContent: [
      { label: 'Pro uniquement', text: '3 variantes générées simultanément depuis la même idée — tu choisis celle qui te ressemble le plus.' },
      { label: 'Édition directe', text: 'Clique sur le post généré et modifie-le comme dans un éditeur. Compteur de caractères live.' },
      { label: 'Régénération', text: "Tu peux régénérer entièrement ou changer de format sans perdre ton idée de base." },
    ],
    backCta: '→ Disponible avec le plan Pro',
  },
  {
    src: '/gear.png', alt: 'Formats', rotate: '0deg',
    title: '4 formats maîtrisés',
    desc: 'Storytelling, conseil direct, prise de position, liste pratique. Chaque format a ses propres règles.',
    backTitle: 'Les 4 formats en détail',
    backContent: [
      { label: 'Storytelling', text: "Hook émotionnel → situation → retournement → leçon. Le format qui génère le plus d'engagement." },
      { label: 'Conseil direct', text: '3 à 5 points actionnables, courts et percutants. Idéal pour partager une expertise.' },
      { label: 'Prise de position', text: 'Opinion tranchée + argumentation + invitation au débat. Génère des commentaires.' },
      { label: 'Liste pratique', text: 'Format numéroté, chaque ligne apporte une valeur. Très partageable, facile à consommer.' },
    ],
  },
  {
    src: '/folder.png', alt: 'Historique', rotate: '0deg',
    title: 'Historique complet · Pro',
    desc: "Tous tes posts Pro sauvegardés automatiquement. Retrouve, réutilise, adapte n'importe lequel en 2 clics.",
    backTitle: "Comment fonctionne l'historique ?",
    backContent: [
      { label: 'Pro uniquement', text: "L'historique complet est réservé au plan Pro. En Free, les posts ne sont pas sauvegardés." },
      { label: 'Retrouver', text: 'Dans "Mon espace" → onglet Historique. Tous les posts avec date, format et idée d\'origine.' },
      { label: 'Réutiliser', text: "Clique sur un post ancien pour le recharger dans l'éditeur et l'adapter." },
    ],
    backCta: '→ Accessible avec le plan Pro',
  },
]

export default function FeaturesSection() {
  const headerRef = useReveal()

  return (
    <section id="features" style={{ padding: '100px 24px', background: '#080808', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div ref={headerRef} className="reveal" style={{ marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)',
            color: Y, borderRadius: 3, padding: '5px 14px',
            fontSize: 11, fontWeight: 700, marginBottom: 20,
            letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
          }}>
            Fonctionnalités
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700,
            color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            Pourquoi <span style={{ whiteSpace: 'nowrap' }}>Linked<span style={{ color: Y }}>AI</span></span> ?
            <Image src="/logo.png" alt="" width={120} height={120} style={{ objectFit: 'contain', display: 'inline-block' }} />
          </h2>
          <p style={{ fontSize: 14, color: MUTED, marginTop: 10, fontFamily: 'Syne, sans-serif' }}>
            Pas juste un autre générateur IA -{' '}
            <em style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>clique sur une carte pour en savoir plus</em>
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {FEATURES.map((f, i) => (
            <FlipCard
              key={i}
              index={i}
              icon={<div style={{ width: 30, height: 30 }} />}
              floatingNode={
                <Image
                  src={f.src}
                  alt={f.alt}
                  width={76}
                  height={76}
                  style={{
                    position: 'absolute', top: -34, left: -26,
                    objectFit: 'contain', zIndex: 10,
                    filter: 'drop-shadow(2px 8px 12px rgba(0,0,0,0.6))',
                    transform: `rotate(${f.rotate})`, pointerEvents: 'none'
                  }}
                />
              }
              title={f.title}
              desc={f.desc}
              backTitle={f.backTitle}
              backContent={f.backContent}
              backCta={f.backCta}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
