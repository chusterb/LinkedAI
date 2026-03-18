'use client'
import { useToast } from '@/lib/toast'
import { BORDER, MUTED, Y, FONT, ITEMS_PER_PAGE, PostHistory, Collection, ActiveTab } from '@/lib/dashboard-types'

const TONES_FILTER = ['all', 'storytelling', 'conseil', 'opinion', 'liste']
const TONE_LABELS: Record<string, string> = { all: 'Tous', storytelling: 'Storytelling', conseil: 'Conseil', opinion: 'Opinion', liste: 'Liste' }

interface HistoryTabProps {
  isPro: boolean
  history: PostHistory[]
  ratings: Record<string, number | null>
  collections: Collection[]
  collectionItems: Record<string, string[]>
  activeCollection: string | null
  setActiveCollection: (col: string | null) => void
  historyFilter: string
  setHistoryFilter: (f: string) => void
  historySearch: string
  setHistorySearch: (s: string) => void
  historyPage: number
  setHistoryPage: React.Dispatch<React.SetStateAction<number>>
  showCollectionPicker: string | null
  setShowCollectionPicker: (id: string | null) => void
  newCollectionName: string
  setNewCollectionName: (name: string) => void
  creatingCollection: boolean
  fullscreenPost: PostHistory | null
  setFullscreenPost: (post: PostHistory | null) => void
  handleRate: (id: string, rating: number) => void
  createCollection: (name: string) => void
  deleteCollection: (colId: string) => void
  togglePostInCollection: (postId: string, colId: string) => void
  loadInEditor: (item: PostHistory, autoGen?: boolean) => void
  exportHistory: (items: PostHistory[]) => void
  setActiveTab: (tab: ActiveTab) => void
}

export default function HistoryTab({
  isPro, history, ratings, collections, collectionItems,
  activeCollection, setActiveCollection,
  historyFilter, setHistoryFilter,
  historySearch, setHistorySearch,
  historyPage, setHistoryPage,
  showCollectionPicker, setShowCollectionPicker,
  newCollectionName, setNewCollectionName,
  creatingCollection, fullscreenPost, setFullscreenPost,
  handleRate, createCollection, deleteCollection,
  togglePostInCollection, loadInEditor, exportHistory, setActiveTab,
}: HistoryTabProps) {
  const { toast } = useToast()

  if (!isPro) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(234,179,8,0.03)', borderRadius: 16, border: '1px solid rgba(234,179,8,0.15)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'white', fontFamily: FONT }}>
          Historique & votes réservés au Pro
        </p>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 28, maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.7, fontFamily: FONT }}>
          Retrouve tous tes posts générés, note-les 👍👎 pour affiner ton style IA, et construis ta bibliothèque de contenus.
        </p>
        <a href="/api/checkout" className="btn-yellow" style={{ fontSize: 13, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }}>
          Passer en Pro - 9€/mois →
        </a>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'white', fontFamily: FONT }}>Aucun post encore</p>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 20, fontFamily: FONT }}>Génère ton premier post depuis l'éditeur.</p>
        <button onClick={() => setActiveTab('editor')} className="btn-yellow" style={{ fontSize: 13, padding: '10px 20px' }}>
          Aller à l'éditeur →
        </button>
      </div>
    )
  }

  const upvoted = Object.values(ratings).filter(r => r === 1).length
  const toneCounts = history.reduce((acc, h) => {
    const t = h.tone || 'storytelling'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topTone = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  const baseFiltered = historyFilter === 'all' ? history : history.filter(h => (h.tone || 'storytelling') === historyFilter)
  const searchFiltered = historySearch.trim()
    ? baseFiltered.filter(h =>
        h.idea.toLowerCase().includes(historySearch.toLowerCase()) ||
        h.post.toLowerCase().includes(historySearch.toLowerCase())
      )
    : baseFiltered
  const filtered = activeCollection
    ? searchFiltered.filter(h => collectionItems[h.id]?.includes(activeCollection))
    : searchFiltered
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE)

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Posts générés', value: history.length },
          { label: 'Upvotés', value: upvoted },
          { label: 'Format favori', value: TONE_LABELS[topTone] || topTone },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: FONT }}>{s.value}</div>
            <div style={{ fontSize: 11, color: MUTED, fontFamily: FONT, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Collections */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: FONT, marginBottom: 8 }}>
          Collections
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setActiveCollection(null)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: FONT, fontWeight: 600,
            border: `1px solid ${activeCollection === null ? Y : BORDER}`,
            background: activeCollection === null ? 'rgba(234,179,8,0.1)' : 'transparent',
            color: activeCollection === null ? Y : MUTED, transition: 'all .15s',
          }}>Tous</button>
          {collections.map(col => (
            <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <button onClick={() => setActiveCollection(activeCollection === col.id ? null : col.id)} style={{
                padding: '5px 10px', borderRadius: '6px 0 0 6px', fontSize: 11, cursor: 'pointer',
                fontFamily: FONT, fontWeight: 600,
                border: `1px solid ${activeCollection === col.id ? Y : BORDER}`, borderRight: 'none',
                background: activeCollection === col.id ? 'rgba(234,179,8,0.1)' : 'transparent',
                color: activeCollection === col.id ? Y : MUTED, transition: 'all .15s',
              }}>
                📁 {col.name}
              </button>
              <button onClick={() => deleteCollection(col.id)} style={{
                padding: '5px 7px', borderRadius: '0 6px 6px 0', fontSize: 10, cursor: 'pointer',
                border: `1px solid ${activeCollection === col.id ? Y : BORDER}`,
                background: activeCollection === col.id ? 'rgba(234,179,8,0.1)' : 'transparent',
                color: MUTED, transition: 'all .15s', lineHeight: 1,
              }} title="Supprimer la collection">×</button>
            </div>
          ))}
          <form onSubmit={e => { e.preventDefault(); createCollection(newCollectionName) }} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder="+ Nouvelle collection"
              style={{
                fontSize: 11, padding: '5px 10px', borderRadius: 6,
                border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)',
                color: 'white', fontFamily: FONT, outline: 'none', width: 160,
              }}
              onFocus={e => e.target.style.borderColor = Y}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
            {newCollectionName.trim() && (
              <button type="submit" disabled={creatingCollection} style={{
                fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${Y}`, background: 'rgba(234,179,8,0.1)', color: Y, fontFamily: FONT, fontWeight: 600,
              }}>
                {creatingCollection ? '…' : 'Créer'}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Search + Export */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={historySearch}
          onChange={e => setHistorySearch(e.target.value)}
          placeholder="Rechercher dans l'historique..."
          style={{
            flex: 1, minWidth: 180, padding: '7px 12px', fontSize: 12,
            border: `1px solid ${BORDER}`, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', color: 'white', fontFamily: FONT, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = Y}
          onBlur={e => e.target.style.borderColor = BORDER}
        />
        <button
          onClick={() => exportHistory(filtered)}
          title="Exporter en CSV"
          style={{
            fontSize: 11, padding: '7px 12px', borderRadius: 8,
            border: `1px solid ${BORDER}`, background: 'transparent',
            color: MUTED, cursor: 'pointer', fontFamily: FONT,
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'color .15s, border-color .15s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exporter CSV
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TONES_FILTER.map(t => (
          <button key={t} onClick={() => setHistoryFilter(t)} style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            fontFamily: FONT, fontWeight: 600, letterSpacing: '0.04em',
            border: `1px solid ${historyFilter === t ? Y : BORDER}`,
            background: historyFilter === t ? 'rgba(234,179,8,0.1)' : 'transparent',
            color: historyFilter === t ? Y : MUTED, transition: 'all .15s',
          }}>
            {TONE_LABELS[t]}{t !== 'all' && toneCounts[t] ? ` (${toneCounts[t]})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 13, fontFamily: FONT, textAlign: 'center', padding: '40px 0' }}>
            {historySearch.trim() ? 'Aucun résultat pour cette recherche.' : 'Aucun post dans ce format.'}
          </p>
        ) : paginated.map(item => (
          <div key={item.id} style={{
            background: 'rgba(255,255,255,0.025)', border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '18px 20px', transition: 'background .15s, border-color .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = BORDER }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#000', background: Y, borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>
                {item.tone || 'storytelling'}
              </span>
              <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT }}>
                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${BORDER}`, fontFamily: FONT }}>
              💡 {item.idea}
            </div>

            <div style={{
              fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'rgba(255,255,255,0.82)', fontFamily: FONT,
              maxHeight: '5.4em', overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              marginBottom: 6,
            }}>
              {item.post}
            </div>
            <button onClick={() => setFullscreenPost(item)} style={{ fontSize: 11, color: MUTED, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: '0 0 10px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Lire en entier
            </button>

            {/* Collection picker */}
            {showCollectionPicker === item.id && (
              <div style={{ background: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}
                onClick={e => e.stopPropagation()}
              >
                {collections.length === 0 && (
                  <p style={{ fontSize: 11, color: MUTED, fontFamily: FONT, margin: 0 }}>Aucune collection. Crée-en une ci-dessus.</p>
                )}
                {collections.map(col => {
                  const inCol = collectionItems[item.id]?.includes(col.id)
                  return (
                    <button key={col.id} onClick={() => togglePostInCollection(item.id, col.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: FONT, cursor: 'pointer',
                      background: inCol ? 'rgba(234,179,8,0.08)' : 'transparent',
                      border: `1px solid ${inCol ? 'rgba(234,179,8,0.3)' : BORDER}`,
                      borderRadius: 6, padding: '6px 10px', color: inCol ? Y : MUTED,
                      transition: 'all .15s', textAlign: 'left',
                    }}>
                      <span>{inCol ? '✓' : '+'}</span> {col.name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
              <button
                onClick={() => setShowCollectionPicker(showCollectionPicker === item.id ? null : item.id)}
                title="Ajouter à une collection"
                style={{
                  fontSize: 13, lineHeight: 1,
                  background: collectionItems[item.id]?.length ? 'rgba(234,179,8,0.1)' : 'transparent',
                  border: `1px solid ${collectionItems[item.id]?.length ? 'rgba(234,179,8,0.4)' : BORDER}`,
                  borderRadius: 6, padding: '3px 7px', cursor: 'pointer', transition: 'all .15s',
                  color: collectionItems[item.id]?.length ? Y : MUTED,
                }}
              >📁</button>
              <button onClick={() => handleRate(item.id, 1)} style={{
                fontSize: 14, lineHeight: 1,
                background: ratings[item.id] === 1 ? 'rgba(52,211,153,0.15)' : 'transparent',
                border: `1px solid ${ratings[item.id] === 1 ? 'rgba(52,211,153,0.4)' : BORDER}`,
                borderRadius: 6, padding: '3px 8px', cursor: 'pointer', transition: 'all .15s',
              }}>👍</button>
              <button onClick={() => handleRate(item.id, -1)} style={{
                fontSize: 14, lineHeight: 1,
                background: ratings[item.id] === -1 ? 'rgba(248,113,113,0.15)' : 'transparent',
                border: `1px solid ${ratings[item.id] === -1 ? 'rgba(248,113,113,0.4)' : BORDER}`,
                borderRadius: 6, padding: '3px 8px', cursor: 'pointer', transition: 'all .15s',
              }}>👎</button>
              <div style={{ flex: 1 }} />
              <button onClick={() => loadInEditor(item, true)} style={{ fontSize: 11, color: MUTED, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: FONT, transition: 'color .15s, border-color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = Y; e.currentTarget.style.borderColor = Y }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
              >↺ Régénérer</button>
              <button onClick={() => loadInEditor(item)} style={{ fontSize: 11, color: MUTED, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: FONT, transition: 'color .15s, border-color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
              >Retravailler</button>
              <button onClick={() => { navigator.clipboard.writeText(item.post).catch(() => {}); toast('Post copié !') }} style={{ fontSize: 11, color: MUTED, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: FONT, transition: 'color .15s, border-color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
              >Copier</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
            disabled={historyPage === 1}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: `1px solid ${BORDER}`, background: 'transparent', color: historyPage === 1 ? 'rgba(255,255,255,0.2)' : MUTED, cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontFamily: FONT, transition: 'color .15s' }}
          >← Précédent</button>
          <span style={{ fontSize: 12, color: MUTED, fontFamily: FONT, minWidth: 80, textAlign: 'center' }}>{historyPage} / {totalPages}</span>
          <button
            onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
            disabled={historyPage === totalPages}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: `1px solid ${BORDER}`, background: 'transparent', color: historyPage === totalPages ? 'rgba(255,255,255,0.2)' : MUTED, cursor: historyPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: FONT, transition: 'color .15s' }}
          >Suivant →</button>
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreenPost && (
        <div
          onClick={() => setFullscreenPost(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#000', background: Y, borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>
                  {fullscreenPost.tone || 'storytelling'}
                </span>
                <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT }}>
                  {new Date(fullscreenPost.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <button onClick={() => setFullscreenPost(null)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.05)', color: MUTED, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
              <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', marginBottom: 16, fontFamily: FONT }}>💡 {fullscreenPost.idea}</div>
              <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.9, color: 'rgba(255,255,255,0.88)', fontFamily: FONT }}>
                {fullscreenPost.post}
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { loadInEditor(fullscreenPost, true); setFullscreenPost(null) }} style={{ fontSize: 12, color: MUTED, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: FONT }}>↺ Régénérer</button>
              <button onClick={() => { loadInEditor(fullscreenPost); setFullscreenPost(null) }} style={{ fontSize: 12, color: MUTED, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: FONT }}>Retravailler</button>
              <button onClick={() => { navigator.clipboard.writeText(fullscreenPost.post).catch(() => {}); toast('Post copié !') }} className="btn-yellow" style={{ fontSize: 12, padding: '8px 16px' }}>Copier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
