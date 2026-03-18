'use client'
import { useReveal } from '@/lib/hooks/use-reveal'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.55)'
const BORDER = 'rgba(255,255,255,0.07)'

const STEPS = [
  {
    number: '01',
    title: 'Donne une idée brute',
    desc: "Une phrase, une expérience, une opinion. Pas besoin de la formuler parfaitement — c'est le rôle de l'IA.",
    detail: 'Ex : "J\'ai raté mon premier lancement. Voilà ce que ça m\'a appris."',
  },
  {
    number: '02',
    title: "L'IA écrit dans ton style",
    desc: "Elle analyse tes anciens posts pour reproduire ta façon d'écrire : ton rythme, ton vocabulaire, ta structure.",
    detail: 'Résultat en moins de 5 secondes. Pas du contenu générique.',
  },
  {
    number: '03',
    title: 'Copie et publie',
    desc: "Édite directement si tu veux, puis copie en un clic. Prêt pour LinkedIn.",
    detail: 'Historique complet disponible en version Pro.',
  },
]

export default function HowItWorksSection() {
  const headerRef = useReveal()

  return (
    <section style={{
      padding: '100px 24px',
      background: '#0d0d0d',
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div ref={headerRef} className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)',
            color: Y, borderRadius: 3, padding: '5px 14px',
            fontSize: 11, fontWeight: 700, marginBottom: 20,
            letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
          }}>
            Comment ça marche
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700,
            color: 'white', fontFamily: 'Syne, sans-serif',
            letterSpacing: '-0.025em', marginBottom: 14,
          }}>
            3 étapes, moins d'une minute
          </h2>
          <p style={{ fontSize: 15, color: MUTED, fontFamily: 'Syne, sans-serif', maxWidth: 420, margin: '0 auto' }}>
            De l'idée au post publié. Sans se battre avec une page blanche.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          position: 'relative',
        }}>
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useReveal(0.1)

  return (
    <div
      ref={ref}
      className={`reveal reveal-d${index + 1}`}
      style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 16, padding: '28px 24px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Step number */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
        fontSize: 12, fontWeight: 800, color: Y, fontFamily: 'Syne, sans-serif',
        flexShrink: 0,
      }}>
        {index + 1}
      </div>

      <h3 style={{
        fontSize: 16, fontWeight: 700, color: 'white',
        fontFamily: 'Syne, sans-serif', lineHeight: 1.3, margin: 0,
      }}>
        {step.title}
      </h3>

      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
        fontFamily: 'Syne, sans-serif', margin: 0, flex: 1,
      }}>
        {step.desc}
      </p>

      <div style={{
        fontSize: 12, color: 'rgba(255,255,255,0.30)',
        fontFamily: 'Syne, sans-serif', fontStyle: 'italic',
        lineHeight: 1.5, paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {step.detail}
      </div>
    </div>
  )
}
