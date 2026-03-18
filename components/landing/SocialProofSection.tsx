'use client'
import { useReveal } from '@/lib/hooks/use-reveal'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.55)'
const BORDER = 'rgba(255,255,255,0.07)'

const TESTIMONIALS = [
  {
    quote: "Je passais 2h à rédiger un post. Maintenant c'est 10 minutes — et le résultat sonne vraiment comme moi.",
    author: 'Marie L.',
    role: 'Consultante RH · Paris',
    initials: 'ML',
  },
  {
    quote: "La démo m'a convaincu en 30 secondes. Le post généré avait exactement mon style, sans rien configurer.",
    author: 'Thomas D.',
    role: 'Founder · Lyon',
    initials: 'TD',
  },
  {
    quote: "Enfin un outil IA qui comprend les codes du LinkedIn français. Pas du contenu américain recyclé.",
    author: 'Sophie M.',
    role: 'Coach business · Bordeaux',
    initials: 'SM',
  },
]

const STATS = [
  { value: '2 000+', label: 'posts générés' },
  { value: '< 5s', label: 'par génération' },
  { value: '9€', label: 'par mois tout inclus' },
]

export default function SocialProofSection() {
  const headerRef = useReveal()

  return (
    <section style={{
      padding: '100px 24px',
      background: `radial-gradient(circle at 50% 0%, rgba(234,179,8,0.03) 0%, #080808 60%)`,
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div ref={headerRef} className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)',
            color: Y, borderRadius: 3, padding: '5px 14px',
            fontSize: 11, fontWeight: 700, marginBottom: 20,
            letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
          }}>
            Ils utilisent LinkedAI
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700,
            color: 'white', fontFamily: 'Syne, sans-serif',
            letterSpacing: '-0.025em', marginBottom: 12,
          }}>
            Ce que disent nos utilisateurs
          </h2>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
          gap: 0, marginBottom: 56,
          border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12,
          overflow: 'hidden', background: 'rgba(255,255,255,0.015)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          maxWidth: 600, margin: '0 auto 56px',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: '1 1 140px', textAlign: 'center',
              padding: '20px 32px',
              borderRight: i < STATS.length - 1 ? `1px solid rgba(255,255,255,0.07)` : 'none',
            }}>
              <div style={{
                fontSize: 22, fontWeight: 800, color: 'white',
                fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em',
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 11, color: MUTED, marginTop: 4,
                fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em',
                textTransform: 'uppercase', fontWeight: 600,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const ref = useReveal(0.1)
  return (
    <div
      ref={ref}
      className={`reveal reveal-d${index + 1}`}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 16, padding: '28px 24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      {/* Quote mark */}
      <div style={{
        fontSize: 40, lineHeight: 1, color: 'rgba(234,179,8,0.25)',
        fontFamily: 'Georgia, serif', userSelect: 'none',
        marginBottom: -8,
      }}>
        "
      </div>

      <p style={{
        fontSize: 14, color: 'rgba(255,255,255,0.80)', lineHeight: 1.75,
        fontFamily: 'Syne, sans-serif', margin: 0, flex: 1,
        fontStyle: 'italic',
      }}>
        {t.quote}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(234,179,8,0.1))',
          border: '1px solid rgba(234,179,8,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: Y, fontFamily: 'Syne, sans-serif',
          flexShrink: 0,
        }}>
          {t.initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif' }}>
            {t.author}
          </div>
          <div style={{ fontSize: 12, color: MUTED, fontFamily: 'Syne, sans-serif', marginTop: 2 }}>
            {t.role}
          </div>
        </div>
      </div>
    </div>
  )
}
