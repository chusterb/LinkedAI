'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { usePostHog } from '@/components/PostHogProvider'

interface AuthDrawerProps {
  open: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}

type Status = 'idle' | 'loading' | 'success' | 'reset-sent'

const BG = '#111111'
const BORDER = 'rgba(255,255,255,0.08)'
const MUTED = 'rgba(255,255,255,0.4)'
const Y = '#EAB308'

export default function AuthDrawer({ open, onClose, defaultMode = 'login' }: AuthDrawerProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [forgotMode, setForgotMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [linkedinLoading, setLinkedinLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const supabase = createClient()
  const router = useRouter()
  const { capture } = usePostHog()

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'

  useEffect(() => {
    if (open) {
      setMode(defaultMode)
      setForgotMode(false)
      setError('')
      setInfo('')
      setEmail('')
      setPassword('')
      setStatus('idle')
    }
  }, [open, defaultMode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isLoading && !isSuccess) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, isLoading, isSuccess])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (isSuccess) {
      sessionStorage.setItem('auth_transition', '1')
      const t = setTimeout(() => { router.push('/dashboard') }, 250)
      return () => clearTimeout(t)
    }
  }, [isSuccess, router])

  const handleLinkedIn = () => {
    setLinkedinLoading(true)
    setError('')
    window.location.href = '/api/auth/login'
  }

  const handleGoogle = () => {
    setGoogleLoading(true)
    setError('')
    window.location.href = '/api/auth/google'
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    })
    if (error) { setError(error.message); setStatus('idle'); return }
    setStatus('reset-sent')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    setInfo('')

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setStatus('idle'); return }
      capture('signup', { method: 'email' })
      if (!data.session) {
        setInfo('Email de confirmation envoyé à ' + email + '. Clique sur le lien puis connecte-toi.')
        setStatus('idle')
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setStatus('idle'); return }
      capture('login', { method: 'email' })
    }

    setStatus('success')
  }

  const drawerVisible = open && !isSuccess

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { if (!isLoading && !isSuccess) onClose() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: isSuccess ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)',
          backdropFilter: isSuccess ? 'blur(10px)' : 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open && !isSuccess ? 'auto' : 'none',
          transition: 'opacity .3s ease, background .4s ease, backdrop-filter .4s ease',
        }}
      />

      {/* Success spinner */}
      {isSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn .3s ease',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.1)',
              borderTop: `2px solid ${Y}`,
              animation: 'spin .7s linear infinite',
            }} />
            <span style={{ fontSize: 14, color: MUTED, fontFamily: 'DM Sans, sans-serif' }}>
              Connexion en cours...
            </span>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
        width: 420, maxWidth: '100vw',
        background: BG,
        borderLeft: `1px solid ${BORDER}`,
        boxShadow: '-40px 0 80px rgba(0,0,0,0.6)',
        transform: drawerVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .4s cubic-bezier(0.32, 0.72, 0, 1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        color: 'white',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px 20px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image src="/logo.png" alt="" width={36} height={36} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' }}>
              Linked<span style={{ color: Y }}>AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${BORDER}`,
              background: 'rgba(255,255,255,0.06)', color: MUTED,
              fontSize: 18, cursor: isLoading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .15s, color .15s',
              opacity: isLoading ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = MUTED }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px', flex: 1 }}>
          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setInfo('') }} disabled={isLoading} style={{
                flex: 1, padding: '9px 0', borderRadius: 7, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: isLoading ? 'default' : 'pointer',
                background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: mode === m ? 'white' : MUTED,
                transition: 'all .2s', fontFamily: 'DM Sans, sans-serif',
              }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* LinkedIn */}
          <button onClick={handleLinkedIn} disabled={linkedinLoading || isLoading} style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: 'none', background: '#0a66c2', color: 'white',
            fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: (linkedinLoading || isLoading) ? 'wait' : 'pointer',
            marginBottom: 20, transition: 'opacity .15s',
            fontFamily: 'DM Sans, sans-serif',
            opacity: (linkedinLoading || isLoading) ? 0.6 : 1,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {linkedinLoading ? 'Redirection...' : 'Continuer avec LinkedIn'}
          </button>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading || isLoading} style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.05)', color: 'white',
            fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: (googleLoading || isLoading) ? 'wait' : 'pointer',
            marginBottom: 20, transition: 'opacity .15s, background .15s',
            fontFamily: 'DM Sans, sans-serif',
            opacity: (googleLoading || isLoading) ? 0.6 : 1,
          }}
            onMouseEnter={e => { if (!googleLoading && !isLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
          </button>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <span style={{ fontSize: 12, color: MUTED }}>ou</span>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          {/* Forgot password view */}
          {forgotMode ? (
            <form onSubmit={handleForgotPassword}>
              {status === 'reset-sent' ? (
                <div style={{
                  textAlign: 'center', padding: '24px 0',
                  animation: 'fadeIn .3s ease',
                }}>
                  <Image src="/bell-icon.png" alt="" width={72} height={72} style={{ objectFit: 'contain', marginBottom: 4 }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 8 }}>Email envoyé !</p>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>
                    Consulte ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
                  </p>
                  <button type="button" onClick={() => { setForgotMode(false); setStatus('idle'); setEmail('') }}
                    style={{ fontSize: 13, color: Y, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.6 }}>
                    Saisis ton email et on t&apos;envoie un lien pour réinitialiser ton mot de passe.
                  </p>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="toi@exemple.fr" required disabled={isLoading}
                      style={{
                        width: '100%', padding: '11px 14px', border: `1px solid ${BORDER}`,
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        background: 'rgba(255,255,255,0.05)', color: 'white',
                        fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = Y}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                  </div>
                  {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 14 }}>{error}</p>}
                  <button type="submit" disabled={isLoading} className="btn-yellow" style={{
                    width: '100%', padding: 13, fontSize: 14, marginBottom: 14,
                    opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer',
                  }}>
                    {isLoading ? 'Envoi...' : 'Envoyer le lien →'}
                  </button>
                  <button type="button" onClick={() => { setForgotMode(false); setError('') }}
                    style={{ width: '100%', fontSize: 13, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                    ← Retour à la connexion
                  </button>
                </>
              )}
            </form>
          ) : (
          /* Normal login/signup form */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="toi@exemple.fr" required disabled={isLoading}
                style={{
                  width: '100%', padding: '11px 14px', border: `1px solid ${BORDER}`,
                  borderRadius: 8, fontSize: 14, outline: 'none',
                  background: 'rgba(255,255,255,0.05)', color: 'white',
                  fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = Y}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Minimum 6 caractères' : '••••••••'}
                required minLength={6} disabled={isLoading}
                style={{
                  width: '100%', padding: '11px 14px', border: `1px solid ${BORDER}`,
                  borderRadius: 8, fontSize: 14, outline: 'none',
                  background: 'rgba(255,255,255,0.05)', color: 'white',
                  fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = Y}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {/* Mot de passe oublié */}
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <button type="button" onClick={() => { setForgotMode(true); setError(''); setInfo('') }}
                  style={{ fontSize: 12, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = Y}
                  onMouseLeave={e => e.currentTarget.style.color = MUTED}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            {mode === 'signup' && <div style={{ marginBottom: 20 }} />}

            {info && (
              <div style={{
                fontSize: 13, color: Y,
                background: 'rgba(234,179,8,0.1)', border: `1px solid rgba(234,179,8,0.25)`,
                borderRadius: 8, padding: '10px 14px', marginBottom: 14, lineHeight: 1.5,
              }}>
                📬 {info}
              </div>
            )}
            {error && (
              <p style={{ fontSize: 13, color: '#f87171', marginBottom: 14 }}>{error}</p>
            )}

            <button type="submit" disabled={isLoading} className="btn-yellow" style={{
              width: '100%', padding: 13, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'wait' : 'pointer',
            }}>
              {isLoading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  Connexion...
                </>
              ) : (
                mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'
              )}
            </button>
          </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', lineHeight: 1.5 }}>
            En continuant, tu acceptes nos conditions d'utilisation.<br />
            Pas de carte bancaire pour l'essai gratuit.
          </p>
        </div>
      </div>
    </>
  )
}
