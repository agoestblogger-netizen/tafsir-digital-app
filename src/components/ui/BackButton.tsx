'use client'
import { useRouter, usePathname } from 'next/navigation'
import { getBackUrl } from '@/lib/navigation'

interface BackButtonProps {
  label?: string
  overrideUrl?: string // untuk kasus khusus
}

export function BackButton({ label, overrideUrl }: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    const backUrl = overrideUrl || getBackUrl(pathname)
    router.push(backUrl)
  }

  return (
    <button
      onClick={handleBack}
      className="font-cairo text-sm font-bold flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
      style={{
        color: 'var(--text2)',
        background: 'rgba(10,21,32,0.5)',
        border: '1px solid rgba(201,163,90,0.1)',
      }}
    >
      ← {label || 'Kembali'}
    </button>
  )
}
