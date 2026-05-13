"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KultumResultView } from '@/components/specific/KultumResultView'
import { KhotbahJumatView, KhotbahJumatOutput } from '@/components/specific/KhotbahJumatView'
import { KultumOutput } from '@/app/api/kultum-generator/route'
import { Loader2 } from 'lucide-react'

export default function KultumPreviewPage() {
  const router = useRouter()
  const [konten, setKonten] = useState<KultumOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dataStr = sessionStorage.getItem('kultum_result')
    if (dataStr) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setKonten(JSON.parse(dataStr))
      } catch (e) {
        console.error('Failed to parse preview data', e)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo">
        <Loader2 className="w-12 h-12 text-[var(--gold)] animate-spin" />
      </div>
    )
  }

  if (!konten) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-cairo text-center px-4">
        <h2 className="text-2xl font-bold text-[var(--gold)] mb-4">Tidak ada preview</h2>
        <p className="text-[var(--text2)] mb-6">Sesi preview Anda telah berakhir atau belum ada kultum yang digenerate.</p>
        <button onClick={() => router.push('/kultum')} className="px-6 py-2 bg-[var(--gold)] text-[var(--dark)] rounded-full font-bold">
          Kembali ke Generator
        </button>
      </div>
    )
  }

  if (konten.format === 'khotbah_jumat') {
    return (
      <KhotbahJumatView 
        konten={konten as unknown as KhotbahJumatOutput} 
        isSaved={false}
      />
    )
  }

  return (
    <KultumResultView 
      konten={konten} 
      isSaved={false} // user is not logged in or data is just temporary
    />
  )
}
