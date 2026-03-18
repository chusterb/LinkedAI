'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import UpgradeModal from '@/components/UpgradeModal'
import { useToast } from '@/lib/toast'
import { usePostHog } from '@/components/PostHogProvider'
import { FREE_DAILY_LIMIT } from '@/lib/plans'

const TONES = [
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'conseil', label: 'Conseil direct' },
  { id: 'opinion', label: 'Prise de position' },
  { id: 'liste', label: 'Liste pratique' },
]

const BORDER = 'rgba(255,255,255,0.07)'
const MUTED = 'rgba(255,255,255,0.42)'
const Y = '#EAB308'
const FONT = 'Syne, sans-serif'

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  display: 'block',
  marginBottom: 8,
  color: 'rgba(255,255,255,0.45)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  fontFamily: FONT,
}

interface EditorProps {
  userId: string
  stylePosts: string[]
  styleProfile?: Record<string, string>
  onPostSaved: () => void
  todayGenCount?: number
  isPro?: boolean
  initialIdea?: string
  initialTone?: string
  autoGenerate?: boolean
}

export default function Editor({ userId, stylePosts, styleProfile, onPostSaved, todayGenCount = 0, isPro = false, initialIdea = '', initialTone = 'storytelling', autoGenerate = false }: EditorProps) {
  const [idea, setIdea] = useState(initialIdea)
  const [tone, setTone] = useState(initialTone)
  const [generated, setGenerated] = useState('')
  const [edited, setEdited] = useState('')
  const [loading, setLoading] = useState(false)
  const [variantsLoading, setVariantsLoading] = useState(false)
  const [variants, setVariants] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [currentGenCount, setCurrentGenCount] = useState(todayGenCount)
  const [isMac, setIsMac] = useState(false)
  const supabase = createClient()
  const didAutoGenerate = useRef(false)
  const { toast } = useToast()
  const { capture } = usePostHog()

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform))
  }, [])

  const isLimitReached = !isPro && currentGenCount >= FREE_DAILY_LIMIT

  useEffect(() => {
    if (autoGenerate && initialIdea && !didAutoGenerate.current && !isLimitReached) {
      didAutoGenerate.current = true
      generate()
    }
  }, [])

  const callGenerate = async (): Promise<string> => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, tone, stylePosts, styleProfile }),
    })
    if (res.status === 429) { setShowUpgrade(true); throw new Error('limit_reached') }
    if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Erreur de génération') }
    setCurrentGenCount(c => c + 1)
    capture('post_generated', { tone })
    const data = await res.json()
    return data.post || 'Erreur lors de la génération.'
  }

  const generate = async () => {
    if (!idea.trim() || loading) return
    if (isLimitReached) { setShowUpgrade(true); capture('upgrade_click', { source: 'limit_reached' }); return }
    setLoading(true); setGenerated(''); setEdited(''); setVariants([]); setSaved(false)
    try {
      const post = await callGenerate()
      setGenerated(post); setEdited(post); setCharCount(post.length)
    } catch (e) {
      if ((e as Error).message !== 'limit_reached') {
        setGenerated('Erreur de connexion.')
        toast('Erreur de génération — réessaie dans quelques secondes', 'error')
      }
    }
    setLoading(false)
  }

  const generateVariants = async () => {
    if (!idea.trim() || variantsLoading || loading) return
    if (isLimitReached) { setShowUpgrade(true); return }
    setVariantsLoading(true); setGenerated(''); setEdited(''); setVariants([]); setSaved(false)
    try {
      const results = await Promise.all([callGenerate(), callGenerate(), callGenerate()])
      setVariants(results)
    } catch (e) {
      if ((e as Error).message !== 'limit_reached') setVariants(['Erreur de connexion.', '', ''])
    }
    setVariantsLoading(false)
  }

  const selectVariant = (v: string) => {
    setGenerated(v); setEdited(v); setCharCount(v.length); setVariants([])
  }

  const handleEdit = (val: string) => { setEdited(val); setCharCount(val.length); setSaved(false) }

  const handleCopy = () => {
    navigator.clipboard.writeText(edited)
    setCopied(true)
    toast('Post copié dans le presse-papier !')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!edited || !userId) return
    await supabase.from('posts_history').insert({ user_id: userId, idea, post: edited, tone })
    setSaved(true)
    onPostSaved()
    toast('Post sauvegardé dans l\'historique !')
  }

  const charColor = charCount > 3000 ? '#f87171' : charCount > 2000 ? Y : MUTED
  const remainingGens = FREE_DAILY_LIMIT - currentGenCount

  return (
    <div>
      {/* PLAN BADGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {!isPro && (
          <span
            onClick={() => setShowUpgrade(true)}
            style={{
              fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: FONT,
              color: isLimitReached ? '#f87171' : remainingGens <= 2 ? Y : MUTED,
              background: isLimitReached ? 'rgba(248,113,113,0.08)' : remainingGens <= 2 ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isLimitReached ? 'rgba(248,113,113,0.2)' : remainingGens <= 2 ? 'rgba(234,179,8,0.2)' : BORDER}`,
              borderRadius: 20, padding: '3px 12px', transition: 'all .15s',
            }}
          >
            {isLimitReached
              ? '🚫 Limite atteinte — Passer en Pro →'
              : `✦ ${remainingGens} génération${remainingGens > 1 ? 's' : ''} restante${remainingGens > 1 ? 's' : ''} aujourd'hui`
            }
          </span>
        )}
        {currentGenCount > 0 && !isLimitReached && (
          <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT }}>
            {currentGenCount} généré{currentGenCount > 1 ? 's' : ''} aujourd'hui
          </span>
        )}
      </div>

      {/* IDEA INPUT */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL_STYLE}>
          Ton idée
        </label>
        <textarea
          value={idea}
          onChange={e => setIdea(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
          placeholder="Ex : J'ai raté 3 clients en un mois parce que je proposais mes tarifs trop tôt dans la conversation..."
          style={{
            width: '100%', height: 100, padding: '12px 14px',
            border: `1px solid ${BORDER}`, borderRadius: 10, resize: 'vertical',
            fontSize: 14, outline: 'none',
            background: 'rgba(255,255,255,0.05)', color: 'white',
            lineHeight: 1.6, fontFamily: FONT, fontWeight: 400,
            transition: 'border-color .15s',
          }}
          onFocus={e => e.target.style.borderColor = Y}
          onBlur={e => e.target.style.borderColor = BORDER}
        />
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4, textAlign: 'right', fontFamily: FONT }}>
          {isMac ? 'Cmd' : 'Ctrl'}+Enter pour générer
        </div>
      </div>

      {/* TONE SELECTOR */}
      <div style={{ marginBottom: 24 }}>
        <label style={LABEL_STYLE}>
          Format
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TONES.map(t => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 13,
                border: `1px solid ${tone === t.id ? Y : BORDER}`,
                background: tone === t.id ? Y : 'transparent',
                color: tone === t.id ? '#000' : MUTED,
                fontWeight: tone === t.id ? 600 : 400,
                cursor: 'pointer', transition: 'all .15s',
                fontFamily: FONT,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* GENERATE BUTTONS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <button
          onClick={generate}
          disabled={!idea.trim() || loading || variantsLoading}
          className="btn-yellow"
          style={{ flex: 1, padding: 14, fontSize: 14 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✦</span>
              Génération en cours...
            </span>
          ) : isLimitReached ? '🚫 Limite atteinte' : '✦ Générer le post'}
        </button>
        <button
          onClick={() => {
            if (!isPro) { setShowUpgrade(true); return }
            generateVariants()
          }}
          disabled={!idea.trim() || loading || variantsLoading}
          style={{
            padding: '14px 18px', fontSize: 14, whiteSpace: 'nowrap',
            background: isPro ? 'transparent' : 'rgba(234,179,8,0.05)',
            color: isPro ? MUTED : Y,
            border: `1px solid ${isPro ? BORDER : 'rgba(234,179,8,0.2)'}`,
            borderRadius: 10, cursor: 'pointer',
            fontFamily: FONT, transition: 'color .15s, border-color .15s, background .15s',
            display: 'flex', alignItems: 'center', gap: 7,
          }}
          onMouseEnter={e => {
            if (isPro) { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }
            else { e.currentTarget.style.background = 'rgba(234,179,8,0.10)' }
          }}
          onMouseLeave={e => {
            if (isPro) { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }
            else { e.currentTarget.style.background = 'rgba(234,179,8,0.05)' }
          }}
          title={isPro ? 'Génère 3 variantes à comparer et choisir la meilleure' : 'Feature Pro — génère 3 variantes du même post pour choisir la meilleure'}
        >
          {variantsLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✦</span>
              3 variantes...
            </span>
          ) : (
            <>
              {!isPro && <span style={{ fontSize: 10, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', color: Y, borderRadius: 4, padding: '1px 5px', fontWeight: 700, letterSpacing: '0.06em' }}>PRO</span>}
              ⊕ 3 variantes
            </>
          )}
        </button>
      </div>

      {/* VARIANTS LOADING */}
      {variantsLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: MUTED, marginBottom: 4, fontFamily: FONT }}>
            Génération de 3 variantes en parallèle...
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[90, 75, 85, 60].map((w, j) => (
                  <div key={j} style={{ height: 13, borderRadius: 6, width: `${w}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.4s infinite ${(i * 4 + j) * 0.08}s` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VARIANTS SELECTION */}
      {variants.length === 3 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: MUTED, fontFamily: FONT }}>
            3 variantes générées — clique sur celle que tu préfères pour l'éditer
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {variants.map((v, i) => (
              <div
                key={i}
                onClick={() => selectVariant(v)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                  transition: 'background .15s, border-color .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = `rgba(234,179,8,0.4)` }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = BORDER }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#000', background: Y, borderRadius: 4, padding: '2px 10px', fontFamily: FONT }}>
                    Variante {i + 1}
                  </span>
                  <span style={{ fontSize: 12, color: MUTED, fontFamily: FONT }}>{v.length} car. · Cliquer pour choisir →</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', fontFamily: FONT }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {(generated || loading) && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: `1px solid ${BORDER}`,
            background: 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)',
              textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT,
            }}>
              Post généré — éditable
            </span>
            <span style={{ fontSize: 12, color: charColor, fontWeight: charCount > 2000 ? 500 : 400, fontFamily: FONT }}>
              {charCount} caractères
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: MUTED, fontFamily: FONT }}>L'IA écrit ton post...</div>
            </div>
          ) : (
            <>
              <textarea
                value={edited}
                onChange={e => handleEdit(e.target.value)}
                style={{
                  width: '100%', minHeight: 280, padding: '16px',
                  border: 'none', resize: 'vertical', outline: 'none',
                  fontSize: 14, lineHeight: 1.8, fontFamily: FONT,
                  fontWeight: 400, background: 'transparent', color: 'rgba(255,255,255,0.85)',
                }}
              />
              <div style={{
                padding: '12px 16px', borderTop: `1px solid ${BORDER}`,
                display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center',
              }}>
                <button
                  onClick={() => { if (!isPro) { setShowUpgrade(true); return }; handleSave() }}
                  disabled={saved}
                  title={!isPro ? 'Fonctionnalité Pro - passe en Pro pour sauvegarder tes posts' : undefined}
                  style={{
                    fontSize: 12, background: 'transparent',
                    color: saved ? '#4ade80' : !isPro ? 'rgba(255,255,255,0.25)' : MUTED,
                    border: `1px solid ${saved ? 'rgba(74,222,128,0.3)' : !isPro ? 'rgba(255,255,255,0.08)' : BORDER}`,
                    borderRadius: 8, padding: '7px 14px',
                    cursor: saved ? 'default' : 'pointer',
                    fontFamily: FONT, transition: 'color .15s',
                    position: 'relative',
                  }}
                >
                  {saved ? '✓ Dans l\'historique' : !isPro ? '🔒 Sauvegarder' : '🕓 Sauvegarder'}
                </button>
                <button
                  onClick={generate}
                  style={{
                    fontSize: 12, background: 'transparent', color: MUTED,
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: '7px 14px', cursor: 'pointer',
                    fontFamily: FONT, transition: 'color .15s, border-color .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
                >
                  Regénérer
                </button>
                <button onClick={handleCopy} className="btn-yellow" style={{ fontSize: 12, padding: '8px 18px' }}>
                  {copied ? '✓ Copié !' : 'Copier le post'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        todayCount={currentGenCount}
        dailyLimit={FREE_DAILY_LIMIT}
      />
    </div>
  )
}
