'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: '✦',
}

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', icon: '#4ade80' },
  error: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', icon: '#f87171' },
  info: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', icon: '#EAB308' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toaster */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(18,18,18,0.95)',
                border: `1px solid ${c.border}`,
                borderLeft: `3px solid ${c.icon}`,
                borderRadius: 10,
                padding: '11px 16px',
                fontSize: 13,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                animation: 'toast-in .2s ease',
                minWidth: 200,
                maxWidth: 320,
              }}
            >
              <span style={{ color: c.icon, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {ICONS[t.type]}
              </span>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
