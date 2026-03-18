'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Editor from '@/components/Editor'
import StyleSetup from '@/components/StyleSetup'
import OnboardingWizard from '@/components/OnboardingWizard'
import TransitionLink from '@/components/TransitionLink'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import HistoryTab from '@/components/dashboard/HistoryTab'
import { PostHistory, Collection, ActiveTab, BORDER, MUTED, Y, FONT } from '@/lib/dashboard-types'
import { FREE_DAILY_LIMIT } from '@/lib/plans'

const HISTORY_LIMIT = 50

interface AuthUser {
  id: string
  email?: string
}

function Skeleton() {
  return (
    <div style={{ animation: 'fadeIn .4s ease forwards', padding: '40px 48px' }}>
      <div style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 28, width: 200, borderRadius: 8, marginBottom: 10, background: 'rgba(255,255,255,0.07)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          <div style={{ height: 14, width: 300, borderRadius: 6, background: 'rgba(255,255,255,0.05)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[100, 85, 70, 95, 60, 80].map((w, i) => (
              <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 6, background: 'rgba(255,255,255,0.06)', backgroundSize: '200% 100%', animation: `shimmer 1.4s infinite ${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hasStyle, setHasStyle] = useState(false)
  const [stylePosts, setStylePosts] = useState<string[]>([])
  const [styleProfile, setStyleProfile] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<PostHistory[]>([])
  const [ratings, setRatings] = useState<Record<string, number | null>>({})
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor')
  const [loading, setLoading] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [fromAuth, setFromAuth] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [todayGenCount, setTodayGenCount] = useState(0)
  const [editorKey, setEditorKey] = useState(0)
  const [prefillIdea, setPrefillIdea] = useState('')
  const [prefillTone, setPrefillTone] = useState('storytelling')
  const [prefillAutoGen, setPrefillAutoGen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('all')
  const [fullscreenPost, setFullscreenPost] = useState<PostHistory | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionItems, setCollectionItems] = useState<Record<string, string[]>>({})
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [showCollectionPicker, setShowCollectionPicker] = useState<string | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [historySearch, setHistorySearch] = useState('')
  const [historyPage, setHistoryPage] = useState(1)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setHistoryPage(1) }, [historyFilter, activeCollection, historySearch])

  useEffect(() => {
    const hasTransition = sessionStorage.getItem('auth_transition') === '1'
    if (hasTransition) {
      setFromAuth(true)
      setOverlayVisible(true)
      sessionStorage.removeItem('auth_transition')
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('upgraded')) window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)

        const [
          { data: styleData },
          { data: histData },
          { data: planData },
          { data: colData },
        ] = await Promise.all([
          supabase.from('user_style').select('posts, profile').eq('user_id', user.id).single(),
          supabase.from('posts_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(HISTORY_LIMIT),
          supabase.from('user_plans').select('plan, plan_expires_at').eq('user_id', user.id).single(),
          supabase.from('post_collections').select('id, name').eq('user_id', user.id).order('created_at', { ascending: true }),
        ])

        const collectionIds = (colData ?? []).map((c: { id: string }) => c.id)
        const { data: colItemsData } = collectionIds.length > 0
          ? await supabase.from('post_collection_items').select('post_id, collection_id').in('collection_id', collectionIds)
          : { data: [] }

        const hasConfiguredStyle = (styleData?.posts?.length ?? 0) > 0
        if (hasConfiguredStyle) { setStylePosts(styleData!.posts); setHasStyle(true) }
        if (styleData?.profile) setStyleProfile(styleData.profile)

        if (histData) {
          setHistory(histData)
          const savedRatings: Record<string, number | null> = {}
          histData.forEach((item: PostHistory) => { if (item.rating != null) savedRatings[item.id] = item.rating })
          setRatings(savedRatings)
        }

        if (colData) setCollections(colData)
        if (colItemsData) {
          const map: Record<string, string[]> = {}
          colItemsData.forEach(({ post_id, collection_id }: { post_id: string; collection_id: string }) => {
            if (!map[post_id]) map[post_id] = []
            map[post_id].push(collection_id)
          })
          setCollectionItems(map)
        }

        const proActive = planData?.plan === 'pro' &&
          (!planData.plan_expires_at || new Date(planData.plan_expires_at) > new Date())
        setIsPro(proActive)

        if (!proActive) {
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          const { count } = await supabase
            .from('generation_logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', todayStart.toISOString())
          setTodayGenCount(count ?? 0)
        }

        setLoading(false)
        setTimeout(() => {
          setContentVisible(true)
          setOverlayVisible(false)
          if (!hasConfiguredStyle && localStorage.getItem('onboarding_skipped') !== '1') {
            setShowOnboarding(true)
          }
        }, 80)
      } catch (err) {
        console.error('[dashboard] init error:', err)
        setLoading(false)
        router.push('/?error=dashboard')
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const exportHistory = (items: PostHistory[]) => {
    const headers = ['Date', 'Idée', 'Format', 'Post']
    const rows = items.map(item => [
      new Date(item.created_at).toLocaleDateString('fr-FR'),
      `"${item.idea.replace(/"/g, '""')}"`,
      item.tone || 'storytelling',
      `"${item.post.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `linkedai-historique-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const refreshHistory = async () => {
    if (!user) return
    const { data } = await supabase
      .from('posts_history').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(HISTORY_LIMIT)
    if (data) {
      setHistory(data)
      const savedRatings: Record<string, number | null> = {}
      data.forEach((item: PostHistory) => { if (item.rating != null) savedRatings[item.id] = item.rating })
      setRatings(savedRatings)
    }
  }

  const loadInEditor = (item: PostHistory, autoGen = false) => {
    setPrefillIdea(item.idea)
    setPrefillTone(item.tone || 'storytelling')
    setPrefillAutoGen(autoGen)
    setEditorKey(k => k + 1)
    setActiveTab('editor')
  }

  const handleRate = async (id: string, rating: number) => {
    const current = ratings[id]
    const newRating = current === rating ? null : rating
    setRatings(prev => ({ ...prev, [id]: newRating }))
    await supabase.from('posts_history').update({ rating: newRating }).eq('id', id)
  }

  const createCollection = async (name: string) => {
    if (!user || !name.trim()) return
    setCreatingCollection(true)
    const { data } = await supabase
      .from('post_collections').insert({ user_id: user.id, name: name.trim() }).select('id, name').single()
    if (data) setCollections(prev => [...prev, data])
    setNewCollectionName('')
    setCreatingCollection(false)
  }

  const deleteCollection = async (colId: string) => {
    const name = collections.find(c => c.id === colId)?.name ?? 'cette collection'
    if (!window.confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return
    await supabase.from('post_collections').delete().eq('id', colId)
    setCollections(prev => prev.filter(c => c.id !== colId))
    if (activeCollection === colId) setActiveCollection(null)
    setCollectionItems(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(pid => { next[pid] = next[pid].filter(id => id !== colId) })
      return next
    })
  }

  const togglePostInCollection = async (postId: string, colId: string) => {
    const inCol = collectionItems[postId]?.includes(colId)
    if (inCol) {
      await supabase.from('post_collection_items').delete().eq('post_id', postId).eq('collection_id', colId)
      setCollectionItems(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(id => id !== colId) }))
    } else {
      await supabase.from('post_collection_items').insert({ post_id: postId, collection_id: colId })
      setCollectionItems(prev => ({ ...prev, [postId]: [...(prev[postId] || []), colId] }))
    }
  }

  const email = user?.email || ''
  const initials = email ? email.slice(0, 2).toUpperCase() : '··'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808', fontFamily: FONT, color: 'white' }}>

      {/* Auth transition overlay */}
      {fromAuth && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: overlayVisible ? 1 : 0, pointerEvents: overlayVisible ? 'auto' : 'none', transition: 'opacity .5s ease',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTop: `2px solid ${Y}`, animation: 'spin .7s linear infinite' }} />
            <span style={{ fontSize: 14, color: MUTED, fontFamily: FONT }}>Chargement de ton espace...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ height: 60, flexShrink: 0, display: 'flex', alignItems: 'center', padding: `0 ${isMobile ? '16px' : '48px'}`, background: '#0b0b0b', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Menu"
            style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 12, flexShrink: 0, transition: 'border-color .15s' }}
          >
            {mobileMenuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        )}
        <TransitionLink href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="" width={40} height={40} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 700, fontFamily: FONT, letterSpacing: '-0.02em', color: 'white', cursor: 'pointer' }}>
            Linked<span style={{ color: Y }}>AI</span>
          </span>
        </TransitionLink>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>

        {/* Mobile backdrop */}
        {isMobile && mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 190, backdropFilter: 'blur(3px)' }} />
        )}

        <DashboardSidebar
          loading={loading}
          isPro={isPro}
          hasStyle={hasStyle}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          email={email}
          initials={initials}
          handleLogout={handleLogout}
        />

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <div className="grain-overlay" />
          {loading && <Skeleton />}
          {!loading && user && (
            <div style={{
              padding: isMobile ? '24px 16px' : '40px 48px',
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity .35s ease, transform .35s ease',
            }}>
              <div style={{ maxWidth: 760 }}>
                {/* Page header */}
                <div style={{ marginBottom: 36 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: FONT, letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                    {activeTab === 'editor' && 'Génère ton post'}
                    {activeTab === 'style' && 'Mon style'}
                    {activeTab === 'history' && 'Historique'}
                  </h1>
                  <p style={{ fontSize: 13, color: MUTED, margin: 0, fontFamily: FONT }}>
                    {activeTab === 'editor' && "Donne une idée brute, même quelques mots. L'IA fait le reste."}
                    {activeTab === 'style' && "L'IA apprend ta façon d'écrire pour reproduire ton style exact."}
                    {activeTab === 'history' && (isPro ? `${history.length} post${history.length > 1 ? 's' : ''} généré${history.length > 1 ? 's' : ''}` : 'Fonctionnalité Pro')}
                  </p>
                </div>

                <div key={activeTab} style={{ animation: 'tabFadeIn .22s ease' }}>
                  {/* Editor tab */}
                  {activeTab === 'editor' && (
                    <>
                      {!hasStyle && (
                        <div style={{ background: 'rgba(234,179,8,0.06)', border: `1px solid rgba(234,179,8,0.2)`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Image src="/lightning_3d.png" alt="" width={32} height={32} style={{ objectFit: 'contain', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: Y, fontFamily: FONT }}>Ton style n'est pas encore configuré</div>
                              <div style={{ fontSize: 12, color: MUTED, marginTop: 2, fontFamily: FONT }}>Les posts générés seront génériques. Ajoute quelques posts de référence pour que l'IA copie ta vraie voix.</div>
                            </div>
                          </div>
                          <button onClick={() => setActiveTab('style')} style={{ fontSize: 12, color: Y, background: 'rgba(234,179,8,0.1)', border: `1px solid rgba(234,179,8,0.3)`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, flexShrink: 0 }}>
                            Configurer →
                          </button>
                        </div>
                      )}
                      {!isPro && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', animation: 'fadeIn .3s ease' }}>
                          <span style={{ fontSize: 12, color: todayGenCount >= FREE_DAILY_LIMIT ? '#f87171' : Y, fontFamily: FONT }}>
                            {todayGenCount >= FREE_DAILY_LIMIT
                              ? `✦ Tu as atteint la limite de ${FREE_DAILY_LIMIT} générations aujourd'hui`
                              : `✦ Tu as utilisé ${todayGenCount}/${FREE_DAILY_LIMIT} générations aujourd'hui`
                            }
                          </span>
                          <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                            <a href="/dashboard/upgrade" style={{ fontSize: 11, color: MUTED, fontWeight: 500, textDecoration: 'none', fontFamily: FONT, whiteSpace: 'nowrap' }}>Voir les offres</a>
                            <a href="/api/checkout" style={{ fontSize: 11, color: Y, fontWeight: 700, textDecoration: 'none', fontFamily: FONT, whiteSpace: 'nowrap' }}>Passe en Pro pour illimité →</a>
                          </div>
                        </div>
                      )}
                      <Editor
                        key={editorKey}
                        userId={user.id}
                        stylePosts={stylePosts}
                        styleProfile={styleProfile}
                        onPostSaved={refreshHistory}
                        todayGenCount={todayGenCount}
                        isPro={isPro}
                        initialIdea={prefillIdea}
                        initialTone={prefillTone}
                        autoGenerate={prefillAutoGen}
                      />
                    </>
                  )}

                  {/* Style tab */}
                  {activeTab === 'style' && (
                    <StyleSetup
                      userId={user.id}
                      initialPosts={stylePosts}
                      initialProfile={styleProfile}
                      onSaved={(posts, profile) => {
                        setStylePosts(posts); setStyleProfile(profile)
                        setHasStyle(true); setActiveTab('editor')
                      }}
                    />
                  )}

                  {/* History tab */}
                  {activeTab === 'history' && (
                    <HistoryTab
                      isPro={isPro}
                      history={history}
                      ratings={ratings}
                      collections={collections}
                      collectionItems={collectionItems}
                      activeCollection={activeCollection}
                      setActiveCollection={setActiveCollection}
                      historyFilter={historyFilter}
                      setHistoryFilter={setHistoryFilter}
                      historySearch={historySearch}
                      setHistorySearch={setHistorySearch}
                      historyPage={historyPage}
                      setHistoryPage={setHistoryPage}
                      showCollectionPicker={showCollectionPicker}
                      setShowCollectionPicker={setShowCollectionPicker}
                      newCollectionName={newCollectionName}
                      setNewCollectionName={setNewCollectionName}
                      creatingCollection={creatingCollection}
                      fullscreenPost={fullscreenPost}
                      setFullscreenPost={setFullscreenPost}
                      handleRate={handleRate}
                      createCollection={createCollection}
                      deleteCollection={deleteCollection}
                      togglePostInCollection={togglePostInCollection}
                      loadInEditor={loadInEditor}
                      exportHistory={exportHistory}
                      setActiveTab={setActiveTab}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showOnboarding && user && (
        <OnboardingWizard
          userId={user.id}
          userEmail={user.email}
          onComplete={(posts, profile) => {
            setStylePosts(posts); setStyleProfile(profile)
            setHasStyle(true); setShowOnboarding(false)
          }}
          onSkip={() => {
            localStorage.setItem('onboarding_skipped', '1')
            setShowOnboarding(false)
          }}
        />
      )}
    </div>
  )
}
