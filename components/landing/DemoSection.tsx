'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useReveal } from '@/lib/hooks/use-reveal'

const Y = '#EAB308'
const MUTED = 'rgba(255,255,255,0.58)'

const DEMO_TONES = [
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'conseil', label: 'Conseil' },
  { id: 'opinion', label: 'Opinion' },
  { id: 'liste', label: 'Liste' },
]

interface DemoSectionProps {
  onSignup: () => void
}

export default function DemoSection({ onSignup }: DemoSectionProps) {
  const [idea, setIdea] = useState('')
  const [tone, setTone] = useState('storytelling')
  const [isMac, setIsMac] = useState(false)
  const [preview, setPreview] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoCount, setDemoCount] = useState(0)
  const [demoBlocked, setDemoBlocked] = useState(false)
  const [demoCopied, setDemoCopied] = useState(false)

  const headerRef = useReveal()
  const cardRef = useReveal(0.1)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform))
  }, [])

  useEffect(() => {
    const count = parseInt(localStorage.getItem('demo_count') || '0')
    setDemoCount(count)
    if (count >= 3) setDemoBlocked(true)
  }, [])

  useEffect(() => {
    if (!preview) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    const speed = Math.max(12, Math.min(22, 4000 / preview.length))
    const id = setInterval(() => {
      i++; setDisplayed(preview.slice(0, i))
      if (i >= preview.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [preview])

  const generate = async () => {
    if (!idea.trim() || loading) return
    if (demoBlocked) { onSignup(); return }
    setLoading(true); setPreview('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, tone, stylePosts: [], demo: true }),
      })
      const data = await res.json()
      setPreview(data.post || 'Erreur lors de la génération.')
      const nc = demoCount + 1
      setDemoCount(nc); localStorage.setItem('demo_count', String(nc))
      if (nc >= 3) setDemoBlocked(true)
    } catch { setPreview('Erreur de connexion.') }
    setLoading(false)
  }

  return (
    <section id="demo" style={{
      padding: '120px 24px',
      background: `radial-gradient(circle at 50% 0%, rgba(234,179,8,0.04) 0%, #0d0d0d 70%)`,
      borderTop: '1px solid rgba(255,255,255,0.07)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(234,179,8,0.03) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div ref={headerRef} className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)',
            color: Y, borderRadius: 3, padding: '5px 14px',
            fontSize: 11, fontWeight: 700, marginBottom: 20,
            letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
          }}>
            Démo interactive
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, marginBottom: 14, color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.025em' }}>
            Essaie maintenant
          </h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 400, margin: '0 auto', fontFamily: 'Syne, sans-serif' }}>
            Aucun compte requis. Donne une idée et vois le résultat s'écrire en direct.
          </p>
        </div>

        <div ref={cardRef} className="reveal reveal-d1" style={{
          background: 'rgba(12,12,12,0.4)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '40px 32px',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.04)',
          position: 'relative', zIndex: 1
        }}>
          {/* Idea input */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 10, color: 'rgba(255,255,255,0.60)', letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>
              Ton idée
            </label>
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
              maxLength={500}
              placeholder="Ex : J'ai pris 3 semaines off cet été. Aucun email, aucun Slack. Mon business a tourné sans moi..."
              style={{
                width: '100%', height: 120, padding: '16px 20px',
                border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, resize: 'vertical',
                fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.02)',
                color: 'white', lineHeight: 1.7, fontFamily: 'Syne, sans-serif', fontWeight: 400,
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', boxSizing: 'border-box',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
              onFocus={e => {
                e.target.style.borderColor = Y
                e.target.style.background = 'rgba(255,255,255,0.04)'
                e.target.style.boxShadow = '0 0 0 4px rgba(234,179,8,0.06), inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                e.target.style.background = 'rgba(255,255,255,0.02)'
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', textAlign: 'right', marginTop: 5, fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em' }}>
              {isMac ? 'Cmd' : 'Ctrl'}+Enter pour générer
            </div>
          </div>

          {/* Format pills */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 10, color: 'rgba(255,255,255,0.60)', letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>
              Format
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DEMO_TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: '10px 22px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                  border: `1px solid ${tone === t.id ? Y : 'rgba(255,255,255,0.1)'}`,
                  background: tone === t.id ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                  color: tone === t.id ? Y : MUTED,
                  fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: tone === t.id ? '0 0 15px rgba(234,179,8,0.1)' : 'none',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!idea.trim() || loading}
            className="btn-yellow"
            style={{ width: '100%', padding: 14, fontSize: 13, marginBottom: preview || loading || demoBlocked ? 28 : 0 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 15 }}>✦</span>
                Génération en cours…
              </span>
            ) : '✦ Générer le post'}
          </button>

          {/* Blocked CTA */}
          {demoBlocked && !preview && (
            <div style={{
              background: 'rgba(234,179,8,0.02)', border: '1px solid rgba(234,179,8,0.15)',
              borderRadius: 20, padding: '40px 24px', textAlign: 'center',
              animation: 'fadeIn .4s ease-out', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}>
              <div style={{ marginBottom: 20, display: 'inline-block', lineHeight: 0 }}>
                <Image src="/logo.png" alt="LinkedAI" width={56} height={56} style={{ objectFit: 'contain' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 12, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>
                On passe à la vitesse supérieure ?
              </div>
              <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px', fontFamily: 'Syne, sans-serif' }}>
                Tu as testé la puissance de l'IA. Pour qu'elle s'adapte à{' '}
                <strong style={{ color: Y, fontWeight: 700 }}>ton style unique</strong> et ne soit plus jamais générique, crée ton espace.
              </div>
              <button onClick={onSignup} className="btn-yellow" style={{ fontSize: 14, padding: '14px 32px', boxShadow: '0 10px 20px rgba(234,179,8,0.15)' }}>
                Créer mon compte - c'est gratuit →
              </button>
            </div>
          )}

          {/* Result */}
          {(preview || loading) && (
            <div style={{
              background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#333,#111)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/character.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif' }}>Ton Profil</div>
                  <div style={{ fontSize: 10, color: MUTED, fontFamily: 'Syne, sans-serif' }}>Maintenant • 🌐</div>
                </div>
                {preview && (
                  <span style={{ fontSize: 10, color: MUTED, fontFamily: 'Syne, sans-serif', opacity: 0.6 }}>
                    {displayed.length} / {preview.length}
                  </span>
                )}
              </div>
              {loading ? (
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[100, 85, 70, 95, 60].map((w, i) => (
                      <div key={i} style={{
                        height: 10, borderRadius: 5, width: `${w}%`,
                        background: 'linear-gradient(90deg, rgba(234,179,8,0.03) 25%, rgba(234,179,8,0.08) 50%, rgba(234,179,8,0.03) 75%)',
                        backgroundSize: '200% 100%', animation: `shimmer 1.5s infinite ${i * 0.12}s`,
                      }} />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    padding: '24px 20px', minHeight: 180, fontSize: 14, lineHeight: 1.8,
                    whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)',
                    fontFamily: 'Syne, sans-serif', fontWeight: 400,
                  }}>
                    {displayed}
                    <span style={{
                      display: 'inline-block', width: 2, height: '1.2em', background: Y,
                      marginLeft: 2, verticalAlign: 'middle',
                      opacity: displayed.length < preview.length ? 1 : 0, transition: 'opacity .3s',
                    }} />
                  </div>
                  {displayed.length >= preview.length && (
                    <div style={{
                      padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)'
                    }}>
                      <span style={{ fontSize: 11, color: MUTED, marginRight: 'auto', fontFamily: 'Syne, sans-serif' }}>
                        {demoBlocked ? 'Limite atteinte' : `${3 - demoCount} essai${3 - demoCount > 1 ? 's' : ''} restant${3 - demoCount > 1 ? 's' : ''}`}
                      </span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(preview); setDemoCopied(true); setTimeout(() => setDemoCopied(false), 2000) }}
                        style={{
                          background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer',
                          fontFamily: 'Syne, sans-serif', fontWeight: 600, transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        {demoCopied ? '✓' : 'Copier'}
                      </button>
                      <button onClick={onSignup} className="btn-yellow" style={{ fontSize: 12, padding: '8px 20px' }}>
                        {demoBlocked ? 'Passer Pro' : 'Créer un compte'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
