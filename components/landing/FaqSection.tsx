'use client'
import { useState } from 'react'
import { useReveal, useRevealChildren } from '@/lib/hooks/use-reveal'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.55)'
const BORDER = 'rgba(255,255,255,0.07)'

const FAQ = [
  { q: "Est-ce que l'IA va vraiment reproduire mon style ?", a: "Oui - à condition de lui donner des posts représentatifs. Plus tes exemples sont variés et authentiques, plus le résultat colle à ta vraie façon d'écrire. La plupart des utilisateurs reconnaissent immédiatement leur style dès la première génération." },
  { q: "Combien de posts de référence faut-il fournir ?", a: "Minimum 3, idéalement 5. Ce ne sont pas des posts parfaits qu'il faut - juste des posts que tu as réellement écrits, qui reflètent ta façon de parler et de structurer tes idées." },
  { q: "Est-ce que mes posts LinkedIn sont stockés quelque part ?", a: "Tes posts de référence et tes posts générés sont stockés dans ta session sécurisée (base de données chiffrée). Ils ne sont jamais partagés, ni utilisés pour entraîner un modèle d'IA." },
  { q: "Quelle IA est utilisée derrière ?", a: "LinkedAI utilise LLaMA 3.3 70B via Groq - un des modèles open-source les plus performants du moment pour la génération de texte en français. La génération prend généralement moins de 5 secondes." },
  { q: "Y a-t-il une limite au nombre de posts que je peux générer ?", a: "En version gratuite, tu disposes de 3 générations par jour — suffisant pour tester et voir que ça marche. La feature variantes (générer 3 versions du même post pour choisir la meilleure) est réservée au Pro. En version Pro (9€/mois), tout est illimité : générations, variantes, sans compteur." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans condition ni frais caché. Tu peux annuler depuis ton espace en 1 clic. Ton accès reste actif jusqu'à la fin de la période payée." },
]

interface FaqSectionProps {
  onSignup?: () => void
}

export default function FaqSection({ onSignup }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const headerRef = useReveal()
  const listRef = useRevealChildren(0.05)
  const ctaRef = useReveal()

  return (
    <section id="faq" style={{ padding: '100px 24px', background: '#0d0d0d', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div ref={headerRef} className="reveal" style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.025em', marginBottom: 10 }}>
            Questions fréquentes
          </h2>
          <p style={{ fontSize: 14, color: MUTED, fontFamily: 'Syne, sans-serif' }}>
            Tout ce qu'il faut savoir avant de commencer
          </p>
        </div>
        <div ref={listRef} style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQ.map((item, i) => (
            <div key={i} className="reveal-left" style={{
              borderBottom: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${openFaq === i ? Y : 'transparent'}`,
              paddingLeft: openFaq === i ? 18 : 0,
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', gap: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Syne, sans-serif', color: 'white', lineHeight: 1.4 }}>
                  {item.q}
                </span>
                <span style={{
                  fontSize: 18, color: openFaq === i ? Y : MUTED, flexShrink: 0,
                  transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform .22s ease, color .22s ease', display: 'inline-block',
                }}>
                  +
                </span>
              </button>
              {openFaq === i && (
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.85, paddingBottom: 24, margin: 0, animation: 'fadeIn .22s ease', fontFamily: 'Syne, sans-serif' }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA de rappel post-FAQ */}
        <div ref={ctaRef} className="reveal" style={{
          marginTop: 64, textAlign: 'center',
          padding: '48px 32px',
          background: 'rgba(234,179,8,0.03)',
          border: '1px solid rgba(234,179,8,0.15)',
          borderRadius: 20,
        }}>
          <p style={{ fontSize: 13, color: MUTED, fontFamily: 'Syne, sans-serif', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
            Convaincu ?
          </p>
          <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Commence gratuitement.
          </h3>
          <p style={{ fontSize: 14, color: MUTED, fontFamily: 'Syne, sans-serif', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
            3 générations par jour, sans carte bancaire. Passe en Pro quand tu veux.
          </p>
          {onSignup && (
            <button onClick={onSignup} className="btn-yellow" style={{ fontSize: 14, padding: '14px 36px' }}>
              Créer mon compte gratuit →
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
