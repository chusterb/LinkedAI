'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'

interface StyleSetupProps {
  userId: string
  initialPosts: string[]
  initialProfile?: Record<string, string>
  onSaved: (posts: string[], profile: Record<string, string>) => void
}

const STYLE_OPTIONS = ['Inspirant', 'Expert', 'Accessible', 'Provocateur', 'Authentique']
const FORMALITY_OPTIONS = ['Très décontracté', 'Naturel', 'Semi-pro', 'Professionnel']
const GOAL_OPTIONS = ['Inspirer', 'Éduquer', 'Générer des leads', 'Provoquer le débat', 'Rayonner']

const BORDER = 'rgba(255,255,255,0.08)'
const MUTED = 'rgba(255,255,255,0.4)'
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

export default function StyleSetup({ userId, initialPosts, initialProfile, onSaved }: StyleSetupProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'profile'>('posts')
  const [posts, setPosts] = useState<string[]>(initialPosts.length > 0 ? initialPosts : ['', '', ''])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Record<string, string>>(initialProfile || {})
  const supabase = createClient()

  const updatePost = (i: number, val: string) => {
    const updated = [...posts]; updated[i] = val; setPosts(updated); setSaved(false)
  }
  const addPost = () => { if (posts.length < 5) setPosts([...posts, '']) }
  const removePost = (i: number) => { if (posts.length > 1) setPosts(posts.filter((_, idx) => idx !== i)) }

  const setProfileField = (key: string, val: string) => { setProfile(prev => ({ ...prev, [key]: val })); setSaved(false) }
  const togglePill = (key: string, val: string) => { setProfile(prev => ({ ...prev, [key]: prev[key] === val ? '' : val })); setSaved(false) }

  const handleSave = async () => {
    const validPosts = posts.filter(p => p.trim().length > 30)
    if (validPosts.length === 0 && activeTab === 'posts') return
    setSaving(true)
    await supabase.from('user_style').upsert(
      { user_id: userId, posts: validPosts, profile },
      { onConflict: 'user_id' }
    )
    setSaving(false); setSaved(true)
    onSaved(validPosts, profile)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true); setImportMsg('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/import-linkedin', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) { setImportMsg('❌ ' + data.error); setImporting(false); return }
      const imported: string[] = data.posts
      setPosts(imported.map(p => p).concat(['', '', '']).slice(0, 5))
      setImportMsg(`✓ ${imported.length} post${imported.length > 1 ? 's' : ''} importé${imported.length > 1 ? 's' : ''} — vérifie et sauvegarde.`)
      setSaved(false)
    } catch { setImportMsg('❌ Erreur lors de l\'import.') }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const validCount = posts.filter(p => p.trim().length > 30).length

  const Pills = ({ fieldKey, options }: { fieldKey: string; options: string[] }) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const selected = profile[fieldKey] === opt
        return (
          <button
            key={opt}
            onClick={() => togglePill(fieldKey, opt)}
            style={{
              padding: '7px 16px', borderRadius: 5, fontSize: 13,
              border: `1px solid ${selected ? Y : BORDER}`,
              background: selected ? Y : 'transparent',
              color: selected ? '#000' : MUTED,
              fontWeight: selected ? 600 : 400,
              cursor: 'pointer', transition: 'all .15s',
              fontFamily: FONT,
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )

  return (
    <div>
      {/* TAB SWITCHER */}
      <div style={{
        display: 'flex', marginBottom: 28,
        border: `1px solid ${BORDER}`, borderRadius: 6,
        padding: 3, background: 'rgba(255,255,255,0.03)',
      }}>
        {(['posts', 'profile'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 500,
              border: 'none', borderRadius: 4,
              cursor: 'pointer', transition: 'all .15s',
              fontFamily: FONT,
              background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === tab ? 'white' : MUTED,
            }}
          >
            {tab === 'posts' ? 'Posts de référence' : 'Profil de style'}
          </button>
        ))}
      </div>

      {/* ── TAB: POSTS ── */}
      {activeTab === 'posts' && (
        <div>
          {/* IMPORT CSV */}
          <div style={{
            background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'rgba(255,255,255,0.8)', fontFamily: FONT }}>
              📥 Importer depuis LinkedIn
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 10, lineHeight: 1.5, fontFamily: FONT }}>
              Télécharge ton export LinkedIn :{' '}
              <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Paramètres LinkedIn → Confidentialité → Obtenir une copie de vos données → Posts</strong>
              {' '}→ tu reçois un ZIP, extrait le fichier{' '}
              <code style={{ background: 'rgba(14,165,233,0.15)', color: '#7dd3fc', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace' }}>Shares.csv</code>{' '}
              et uploade-le ici.
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} id="linkedin-import" />
              <label htmlFor="linkedin-import">
                <span style={{
                  fontSize: 13, display: 'inline-block', cursor: importing ? 'default' : 'pointer',
                  background: 'transparent', color: MUTED,
                  border: `1px solid ${BORDER}`, borderRadius: 8, padding: '7px 14px',
                  opacity: importing ? 0.5 : 1, fontFamily: FONT,
                  pointerEvents: importing ? 'none' : 'auto', transition: 'color .15s',
                }}>
                  {importing ? 'Import en cours...' : 'Choisir Shares.csv'}
                </span>
              </label>
              {importMsg && (
                <span style={{ fontSize: 12, color: importMsg.startsWith('✓') ? '#4ade80' : '#f87171', fontFamily: FONT }}>
                  {importMsg}
                </span>
              )}
            </div>
          </div>

          {/* TIP BANNER */}
          <div style={{
            background: 'rgba(234,179,8,0.06)', border: `1px solid rgba(234,179,8,0.15)`,
            borderRadius: 8, padding: '14px 18px 14px 38px', marginBottom: 24,
            fontSize: 13, color: 'rgba(234,179,8,0.9)', fontFamily: FONT,
            position: 'relative', overflow: 'visible'
          }}>
            <Image
              src="/file.png"
              alt=""
              width={45}
              height={45}
              style={{
                position: 'absolute',
                left: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
              }}
            />
            <span>Plus tes posts de référence sont représentatifs, plus le résultat sera fidèle à ta vraie plume.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map((post, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={LABEL_STYLE}>Post de référence {i + 1}</label>
                  {posts.length > 1 && (
                    <button
                      onClick={() => removePost(i)}
                      style={{ fontSize: 12, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <textarea
                  value={post}
                  onChange={e => updatePost(i, e.target.value)}
                  placeholder="Colle ici le texte complet d'un de tes posts LinkedIn..."
                  style={{
                    width: '100%', height: 140, padding: '12px 14px',
                    border: `1px solid ${post.trim().length > 30 ? 'rgba(74,222,128,0.4)' : BORDER}`,
                    borderRadius: 10, resize: 'vertical', fontSize: 13,
                    outline: 'none', background: 'rgba(255,255,255,0.04)', color: 'white',
                    lineHeight: 1.6, fontFamily: FONT, fontWeight: 400,
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => { if (post.trim().length <= 30) e.target.style.borderColor = Y }}
                  onBlur={e => { if (post.trim().length <= 30) e.target.style.borderColor = BORDER }}
                />
                <div style={{ fontSize: 11, color: MUTED, marginTop: 3, textAlign: 'right', fontFamily: FONT }}>
                  {post.trim().length} caractères{post.trim().length < 30 && post.trim().length > 0 ? ' (trop court)' : ''}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, alignItems: 'center' }}>
            {posts.length < 5 && (
              <button
                onClick={addPost}
                style={{
                  fontSize: 13, background: 'transparent', color: MUTED,
                  border: `1px solid ${BORDER}`, borderRadius: 8,
                  padding: '8px 14px', cursor: 'pointer', fontFamily: FONT,
                  transition: 'color .15s, border-color .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
              >
                + Ajouter un post ({posts.length}/5)
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={validCount === 0 || saving}
              className="btn-yellow"
              style={{ marginLeft: 'auto', fontSize: 14 }}
            >
              {saving ? 'Sauvegarde...' : saved ? '✓ Style sauvegardé' : `Sauvegarder mon style (${validCount} post${validCount > 1 ? 's' : ''})`}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: PROFILE ── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 22,
          }}>
            {[
              { key: 'who', label: 'Qui es-tu en quelques mots ?', placeholder: 'Ex : Fondateur de startup, ex-dev, 10 ans en marketing' },
              { key: 'audience', label: 'Ton audience cible', placeholder: 'Ex : Entrepreneurs, freelances, managers en reconversion' },
            ].map(field => (
              <div key={field.key}>
                <label style={LABEL_STYLE}>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={profile[field.key] || ''}
                  onChange={e => setProfileField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13,
                    outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white',
                    fontFamily: FONT, fontWeight: 400,
                    transition: 'border-color .15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = Y}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>
            ))}

            <div>
              <label style={LABEL_STYLE}>
                Ton style de communication
              </label>
              <Pills fieldKey="style" options={STYLE_OPTIONS} />
            </div>

            <div>
              <label style={LABEL_STYLE}>
                Niveau de formalité
              </label>
              <Pills fieldKey="formality" options={FORMALITY_OPTIONS} />
            </div>

            {[
              { key: 'topics', label: 'Tes sujets de prédilection', placeholder: 'Ex : Leadership, remote work, freelance, no-code...' },
              { key: 'avoid', label: 'Ce que tu veux ÉVITER', placeholder: 'Ex : Jargon corporate, auto-congratulation, phrases trop longues...' },
            ].map(field => (
              <div key={field.key}>
                <label style={LABEL_STYLE}>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={profile[field.key] || ''}
                  onChange={e => setProfileField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13,
                    outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white',
                    fontFamily: FONT, fontWeight: 400,
                    transition: 'border-color .15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = Y}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>
            ))}

            <div>
              <label style={LABEL_STYLE}>
                Ton objectif LinkedIn
              </label>
              <Pills fieldKey="goal" options={GOAL_OPTIONS} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} disabled={saving} className="btn-yellow" style={{ fontSize: 14 }}>
              {saving ? 'Sauvegarde...' : saved ? '✓ Profil sauvegardé' : 'Sauvegarder mon profil'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
