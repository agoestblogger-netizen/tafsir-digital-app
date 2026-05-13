"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { KultumResultView } from '@/components/specific/KultumResultView'
import { KhotbahJumatView, KhotbahJumatOutput } from '@/components/specific/KhotbahJumatView'
import { KultumOutput } from '@/app/api/kultum-generator/route'
import { Loader2 } from 'lucide-react'

export default function KultumHasilPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [konten, setKonten] = useState<KultumOutput | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isUsed, setIsUsed] = useState(false)
  
  // Menggunakan Supabase client
  const supabase = createClient()

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('kultum_history')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Kultum tidak ditemukan atau terjadi kesalahan jaringan.')
      } else {
        setKonten(data.konten as KultumOutput)
        setIsFavorite(data.is_favorit)
        setIsUsed(data.sudah_digunakan)
      }
      setLoading(false)
    }

    fetchData()
  }, [id, supabase])

  const toggleFavorite = async () => {
    const newValue = !isFavorite
    setIsFavorite(newValue)
    await supabase.from('kultum_history').update({ is_favorit: newValue }).eq('id', id)
  }

  const toggleUsed = async () => {
    const newValue = !isUsed
    setIsUsed(newValue)
    await supabase.from('kultum_history').update({ sudah_digunakan: newValue }).eq('id', id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo">
        <Loader2 className="w-12 h-12 text-[var(--gold)] animate-spin" />
      </div>
    )
  }

  if (error || !konten) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-cairo text-center px-4">
        <h2 className="text-2xl font-bold text-[var(--gold)] mb-4">Waduh!</h2>
        <p className="text-[var(--text2)] mb-6">{error}</p>
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
        recordId={id}
        isSaved={true}
        isFavorite={isFavorite}
        isUsed={isUsed}
        onToggleFavorite={toggleFavorite}
        onToggleUsed={toggleUsed}
      />
    )
  }

  return (
    <KultumResultView 
      konten={konten} 
      recordId={id}
      isSaved={true}
      isFavorite={isFavorite}
      isUsed={isUsed}
      onToggleFavorite={toggleFavorite}
      onToggleUsed={toggleUsed}
    />
  )
}
