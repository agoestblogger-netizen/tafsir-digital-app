'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const scrollPositions = new Map<string, number>()

export function useSaveScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(pathname, window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])
}

export function useRestoreScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const saved = scrollPositions.get(pathname)
    if (saved !== undefined) {
      // Restore setelah render selesai
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: 'instant' })
      })
    }
  }, [pathname])
}
