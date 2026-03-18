'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import AuthDrawer from '@/components/AuthDrawer'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import DemoSection from '@/components/landing/DemoSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import FaqSection from '@/components/landing/FaqSection'
import ContactSection from '@/components/landing/ContactSection'
import LandingFooter from '@/components/landing/LandingFooter'

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'login' | 'signup'>('login')
  const [scrolled, setScrolled] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user))
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('auth_error')) {
        setDrawerMode('login'); setDrawerOpen(true)
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const openLogin = () => { setDrawerMode('login'); setDrawerOpen(true) }
  const openSignup = () => { setDrawerMode('signup'); setDrawerOpen(true) }

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: 'Syne, sans-serif', overflowX: 'hidden' }}>
      <AuthDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} defaultMode={drawerMode} />
      <div aria-hidden className="grain-overlay" />

      <LandingNav isLoggedIn={isLoggedIn} scrolled={scrolled} onLogin={openLogin} onSignup={openSignup} />
      <HeroSection isLoggedIn={isLoggedIn} onSignup={openSignup} />
      <DemoSection onSignup={openSignup} />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection isLoggedIn={isLoggedIn} onSignup={openSignup} />
      <FaqSection onSignup={openSignup} />
      <ContactSection />
      <LandingFooter onLogin={openLogin} />
    </main>
  )
}
