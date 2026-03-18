'use client'
import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'

interface TransitionLinkProps {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function TransitionLink({ href, children, style, className }: TransitionLinkProps) {
  const router = useRouter()

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    document.body.style.transition = 'opacity 0.28s ease'
    document.body.style.opacity = '0'
    setTimeout(() => {
      router.push(href)
      requestAnimationFrame(() => {
        document.body.style.opacity = '1'
      })
    }, 260)
  }

  return (
    <a href={href} onClick={handleClick} style={style} className={className}>
      {children}
    </a>
  )
}
