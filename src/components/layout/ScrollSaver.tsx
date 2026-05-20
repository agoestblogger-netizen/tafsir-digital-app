'use client'
import { useSaveScroll } from '@/hooks/useScrollRestore'

export function ScrollSaver() {
  useSaveScroll()
  return null
}
