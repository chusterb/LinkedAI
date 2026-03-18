'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'

interface OnboardingWizardProps {
  userId: string
  userEmail?: string
  onComplete: (posts: string[], profile: Record<string, string>) => void
  onSkip: () => void
}

const STYLE_OPTIONS = ['Inspirant', 'Expert', 'Accessible', 'Provocateur', 'Authentique']
const GOAL_OPTIONS = ['Inspirer', 'Éduquer', 'Générer des leads', 'Provoquer le débat', 'Rayonner']

const CARD_BG = '#111111'
const INPUT_BG = 'rgba(255,255,255,0.04)'
const INPUT_BORDER = 'rgba(255,255,255,0.10)'
const INPUT_BORDER_FOCUS = 'rgba(234,179,8,0.5)'
const SUCCESS_COLOR = '#4ade80'
const SUCCESS_BORDER = 'rgba(74,222,128,0.4)'

const CONFETTI_COLORS = ['#EAB308', '#FCD34D', '#ffffff', '#60a5fa', '#4ade80', '#f472b6', '#fb923c', '#a78bfa']
const CONFETTI_PARTICLES = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  x: (i * 2.1 + Math.sin(i * 1.3) * 15 + 50) % 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width: 5 + (i % 5),
  height: 8 + (i % 4) * 2,
  delay: (i * 0.07) % 1.8,
  duration: 1.6 + (i % 5) * 0.2,
  rotate: (i * 37) % 360,
}))

const STEPS = ['Tes posts', 'Ton profil', 'Terminé']

export default function OnboardingWizard({ userId, userEmail, onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [posts, setPosts] = useState(['', '', ''])
  const [profile, setProfile] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  const [importing, setImporting] = useState(false)

  const supabase = createClient()
  const validCount = posts.filter(p => p.trim().length > 30).length

  const firstName = userEmail
    ? userEmail.split('@')[0].split('.')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].split('.')[0].slice(1)
    : null

  const updatePost = (i: number, val: string) => {
    const updated = [...posts]
    updated[i] = val
    setPosts(updated)
  }

  const setProfileField = (key: string, val: string) => setProfile(prev => ({ ...prev, [key]: val }))
  const togglePill = (key: string, val: string) => setProfile(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }))

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/import-linkedin', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) { setImportMsg('❌ ' + data.error); setImporting(false); return }
      const imported: string[] = data.posts
      setPosts(imported.concat(['', '', '']).slice(0, 3))
      setImportMsg(`✓ ${imported.length} post${imported.length > 1 ? 's' : ''} importé${imported.length > 1 ? 's' : ''}`)
    } catch {
      setImportMsg('❌ Erreur lors de l\'import.')
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleComplete = async () => {
    setSaving(true)
    const validPosts = posts.filter(p => p.trim().length > 30)
    await supabase.from('user_style').upsert(
      { user_id: userId, posts: validPosts, profile },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    setStep(3)
  }

  const Pills = ({ fieldKey, options }: { fieldKey: string; options: string[] }) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const selected = profile[fieldKey] === opt
        return (
          <button
            key={opt}
            onClick={() => togglePill(fieldKey, opt)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              border: `1px solid ${selected ? 'var(--y)' : INPUT_BORDER}`,
              background: selected ? 'rgba(234,179,8,0.12)' : 'transparent',
              color: selected ? 'var(--y)' : 'var(--muted)',
              cursor: 'pointer', transition: 'all .15s',
              fontFamily: 'Syne, sans-serif'
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.80)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'fadeIn .3s ease'
    }}>
      <div style={{
        background: CARD_BG,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        width: '100%', maxWidth: 580,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'wizardSlideUp .35s ease'
      }}>

        {/* Progress bar (steps 1, 2, 3) */}
        {step > 0 && (
          <div style={{ padding: '20px 28px 0' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {STEPS.map((label, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{
                    height: 3, borderRadius: 2,
                    background: step - 1 > i
                      ? 'var(--y)'
                      : step - 1 === i
                        ? 'rgba(234,179,8,0.5)'
                        : 'rgba(255,255,255,0.08)',
                    transition: 'background .4s ease'
                  }} />
                  <div style={{
                    fontSize: 10, marginTop: 5, fontFamily: 'Syne, sans-serif',
                    color: step - 1 >= i ? 'rgba(255,255,255,0.7)' : 'var(--muted)',
                    transition: 'color .3s',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px', position: 'relative' }}>

          {/* ── Step 0: Welcome ──────────────────────────────────────────────── */}
          {step === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 12, animation: 'wizardFadeIn .3s ease' }}>
              <div style={{ fontSize: 44, marginBottom: 20 }}>✦</div>
              <h2 style={{ fontSize: 26, fontFamily: 'Instrument Serif, serif', marginBottom: 12, lineHeight: 1.3 }}>
                {firstName ? `Bienvenue, ${firstName} 👋` : 'Bienvenue sur LinkedAI'}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 32px' }}>
                Pour générer des posts dans <strong style={{ color: 'white' }}>ta vraie voix</strong>, l'IA a besoin d'apprendre ton style. Ça prend 2 minutes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360, margin: '0 auto 36px', textAlign: 'left' }}>
                {[
                  { num: '①', label: 'Tu colles 3 de tes anciens posts LinkedIn' },
                  { num: '②', label: 'Tu décris ton profil en quelques mots' },
                  { num: '③', label: 'L\'IA reproduit exactement ta plume' },
                ].map(item => (
                  <div key={item.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, color: 'var(--y)', flexShrink: 0, lineHeight: 1.3 }}>{item.num}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="btn-yellow"
                style={{ fontSize: 15, padding: '13px 40px', borderRadius: 10 }}
              >
                C'est parti →
              </button>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={onSkip}
                  style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', opacity: 0.6 }}
                >
                  Passer le tuto et configurer plus tard
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Posts ─────────────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ animation: 'wizardFadeIn .3s ease' }}>
              <h3 style={{ fontSize: 20, fontFamily: 'Instrument Serif, serif', marginBottom: 8 }}>
                Tes posts de référence
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Colle 3 de tes vrais posts LinkedIn. Plus ils sont représentatifs, plus l'IA sera précise.
              </p>

              {/* CSV import */}
              <div style={{ marginBottom: 20 }}>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} id="onb-import" />
                <label htmlFor="onb-import">
                  <span style={{
                    fontSize: 12, color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline',
                    opacity: importing ? 0.5 : 1, pointerEvents: importing ? 'none' : 'auto'
                  }}>
                    {importing ? 'Import en cours...' : 'Ou importer via Shares.csv (export LinkedIn)'}
                  </span>
                </label>
                {importMsg && <span style={{ fontSize: 12, marginLeft: 8, color: importMsg.startsWith('✓') ? SUCCESS_COLOR : '#f87171' }}>{importMsg}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {posts.map((post, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 5, color: post.trim().length > 30 ? SUCCESS_COLOR : 'rgba(255,255,255,0.7)' }}>
                      Post {i + 1} {post.trim().length > 30 ? '✓' : ''}
                    </label>
                    <textarea
                      value={post}
                      onChange={e => updatePost(i, e.target.value)}
                      placeholder="Colle le texte complet d'un de tes posts LinkedIn..."
                      style={{
                        width: '100%', height: 110, padding: '10px 12px',
                        border: `1px solid ${post.trim().length > 30 ? SUCCESS_BORDER : INPUT_BORDER}`,
                        borderRadius: 8, resize: 'vertical', fontSize: 13,
                        outline: 'none', background: INPUT_BG, color: 'white', lineHeight: 1.6,
                        fontFamily: 'Syne, sans-serif', fontWeight: 300,
                        transition: 'border-color .15s', boxSizing: 'border-box'
                      }}
                      onFocus={e => { if (post.trim().length <= 30) e.target.style.borderColor = INPUT_BORDER_FOCUS }}
                      onBlur={e => { if (post.trim().length <= 30) e.target.style.borderColor = INPUT_BORDER }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Profile ───────────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ animation: 'wizardFadeIn .3s ease' }}>
              <h3 style={{ fontSize: 20, fontFamily: 'Instrument Serif, serif', marginBottom: 8 }}>
                Ton profil de style
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Ces infos aident l'IA à personnaliser encore plus ta voix. Tu pourras les modifier à tout moment.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 7, color: 'rgba(255,255,255,0.8)' }}>Qui es-tu ?</label>
                  <input
                    type="text"
                    value={profile.who || ''}
                    onChange={e => setProfileField('who', e.target.value)}
                    placeholder="Ex : Fondateur de startup, ex-dev, 10 ans en marketing"
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none', background: INPUT_BG, color: 'white', fontFamily: 'Syne, sans-serif', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = INPUT_BORDER_FOCUS}
                    onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 7, color: 'rgba(255,255,255,0.8)' }}>Ton audience cible</label>
                  <input
                    type="text"
                    value={profile.audience || ''}
                    onChange={e => setProfileField('audience', e.target.value)}
                    placeholder="Ex : Entrepreneurs, freelances, managers en reconversion"
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none', background: INPUT_BG, color: 'white', fontFamily: 'Syne, sans-serif', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = INPUT_BORDER_FOCUS}
                    onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 9, color: 'rgba(255,255,255,0.8)' }}>Ton style de communication</label>
                  <Pills fieldKey="style" options={STYLE_OPTIONS} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 9, color: 'rgba(255,255,255,0.8)' }}>Ton objectif LinkedIn</label>
                  <Pills fieldKey="goal" options={GOAL_OPTIONS} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Success / Confetti ────────────────────────────────────── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', paddingTop: 8, animation: 'wizardFadeIn .4s ease', position: 'relative', overflow: 'hidden', minHeight: 340 }}>

              {/* Confetti particles */}
              {CONFETTI_PARTICLES.map(p => (
                <div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: `${p.x}%`,
                    top: -16,
                    width: p.width,
                    height: p.height,
                    background: p.color,
                    borderRadius: 2,
                    opacity: 0,
                    animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
                    transform: `rotate(${p.rotate}deg)`,
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* Success icon */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(74,222,128,0.12)',
                border: '2px solid rgba(74,222,128,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '24px auto 24px',
                animation: 'successPop .5s cubic-bezier(0.16, 1, 0.3, 1) .15s both',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 style={{
                fontSize: 26, fontFamily: 'Instrument Serif, serif',
                marginBottom: 12, lineHeight: 1.25,
                animation: 'wizardFadeIn .4s ease .2s both',
              }}>
                {firstName ? `C'est bon, ${firstName} ! 🎉` : 'Ton style est configuré ! 🎉'}
              </h2>
              <p style={{
                fontSize: 14, color: 'var(--muted)', lineHeight: 1.7,
                maxWidth: 380, margin: '0 auto 32px',
                animation: 'wizardFadeIn .4s ease .3s both',
              }}>
                L'IA a appris ta façon d'écrire. Tu peux maintenant générer ton premier post — il va te ressembler vraiment.
              </p>

              <button
                onClick={() => {
                  const validPosts = posts.filter(p => p.trim().length > 30)
                  onComplete(validPosts, profile)
                }}
                className="btn-yellow"
                style={{
                  fontSize: 15, padding: '13px 40px', borderRadius: 10,
                  animation: 'wizardFadeIn .4s ease .4s both',
                }}
              >
                Générer mon premier post →
              </button>
            </div>
          )}
        </div>

        {/* Footer nav (steps 1 & 2 only) */}
        {step > 0 && step < 3 && (
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.03)', flexShrink: 0
          }}>
            <button
              onClick={() => setStep(step - 1)}
              style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
            >
              ← Retour
            </button>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {step === 1 && validCount === 0 && (
                <button
                  onClick={() => setStep(2)}
                  style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                >
                  Passer
                </button>
              )}
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={validCount === 0}
                  className="btn-yellow"
                  style={{ fontSize: 14, opacity: validCount === 0 ? 0.35 : 1, cursor: validCount === 0 ? 'default' : 'pointer' }}
                >
                  Continuer ({validCount}/3) →
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="btn-yellow"
                  style={{ fontSize: 14 }}
                >
                  {saving ? 'Sauvegarde...' : 'Terminer et générer →'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wizardSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wizardFadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          80%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(420px) rotate(540deg); }
        }
        @keyframes successPop {
          0%   { opacity: 0; transform: scale(0.5); }
          70%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
