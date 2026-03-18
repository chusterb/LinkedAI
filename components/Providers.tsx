'use client'
import { Suspense } from 'react'
import { ToastProvider } from '@/lib/toast'
import { PostHogProvider } from '@/components/PostHogProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </Suspense>
    </ToastProvider>
  )
}
