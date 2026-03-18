'use client'
import React from 'react'
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'pageEnter 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {children}
    </div>
  )
}
