"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Search, Trash2, Mic, PlayCircle, Star, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type KultumHistory = {
  id: string
  judul: string
  format: string
  tema: string
  is_favorit: boolean
  sudah_digunakan: boolean
  created_at: string
}

type FilterType = 'semua' | 'favorit' | 'belum_dipakai'

export default function KultumHistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<KultumHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('semua')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchHistory() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('kultum_history')
        .select('id, judul, format, tema, is_favorit, sudah_digunakan, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setHistory(data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteTarget(id)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/kultum-delete?id=${deleteTarget}`, { method: 'DELETE' })
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== deleteTarget))
      } else {
        const data = await res.json()
        alert(`Gagal: ${data.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus')
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // 1. Filter by search
      const matchesSearch = 
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.tema.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      // 2. Filter by status
      if (filter === 'favorit' && !item.is_favorit) return false
      if (filter === 'belum_dipakai' && item.sudah_digunakan) return false

      return true
    })
  }, [history, searchQuery, filter])

  // Group by Month-Year
  const groupedHistory = useMemo(() => {
    const groups: Record<string, KultumHistory[]> = {}
    filteredHistory.forEach(item => {
      const date = new Date(item.created_at)
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      if (!groups[monthYear]) groups[monthYear] = []
      groups[monthYear].push(item)
    })
    return groups
  }, [filteredHistory])

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--gold-border)]">
        <div className="arabesque-bg opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <button onClick={() => router.push('/kultum')} className="flex items-center gap-2 text-[var(--text2)] hover:text-[var(--gold-light)] mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Generator
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Mic className="w-6 h-6 text-[var(--gold)]" />
            <h1 className="text-3xl md:text-4xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]">
              Kultum Saya
            </h1>
          </div>
          <p className="text-[var(--text2)] text-sm md:text-base max-w-2xl">
            Riwayat lengkap kultum, khotbah, dan ceramah yang telah Anda buat.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
            <input
              type="text"
              placeholder="Cari judul / tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--dark2)] border border-[var(--gold-border)] rounded-full pl-9 pr-4 py-2 text-sm text-[var(--text1)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button
              onClick={() => setFilter('semua')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${filter === 'semua' ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold-light)]' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)]'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('favorit')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1 ${filter === 'favorit' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)]'}`}
            >
              <Star className="w-3 h-3" /> Favorit
            </button>
            <button
              onClick={() => setFilter('belum_dipakai')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1 ${filter === 'belum_dipakai' ? 'bg-[var(--teal-500)]/20 border-[var(--teal-500)]/30 text-[var(--teal-300)]' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)]'}`}
            >
              <CheckCircle className="w-3 h-3" /> Belum Digunakan
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-[var(--dark3)] border-t-[var(--gold)] rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border-[var(--gold-border)]">
            <Mic className="w-12 h-12 text-[var(--text3)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--text1)] mb-2">Belum ada kultum</h3>
            <p className="text-[var(--text2)] text-sm mb-6">Anda belum pernah membuat kultum atau belum login.</p>
            <button onClick={() => router.push('/kultum')} className="px-6 py-2 bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)] text-[var(--dark)] rounded-full text-sm font-bold shadow-lg">
              Buat Kultum Pertama
            </button>
          </div>
        ) : Object.keys(groupedHistory).length === 0 ? (
          <div className="text-center py-16 text-[var(--text2)] text-sm">
            Tidak ada kultum yang cocok dengan filter pencarian.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([month, items]) => (
              <div key={month} className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--teal-300)] uppercase tracking-widest pl-2 border-l-2 border-[var(--teal-500)]">
                  {month}
                </h3>
                <div className="grid gap-4">
                  {items.map(item => (
                    <div key={item.id} className="group">
                      <div className="glass-card p-5 rounded-2xl border-[var(--gold-border)] hover:border-[var(--teal-500)] transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        {/* Area konten — diklik untuk buka */}
                        <Link href={`/kultum/hasil/${item.id}`} className="flex-1 min-w-0 block">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-[var(--dark3)] border border-[var(--gold-border)] rounded text-[10px] font-bold text-[var(--gold)] uppercase">
                              {item.format}
                            </span>
                            <span className="px-2 py-0.5 bg-[var(--teal-900)]/30 border border-[var(--teal-500)]/30 rounded text-[10px] font-bold text-[var(--teal-200)] uppercase truncate max-w-[150px]">
                              {item.tema}
                            </span>
                            {item.is_favorit && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            )}
                            {item.sudah_digunakan && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <h4 className="text-base font-bold text-[var(--text1)] mb-1 group-hover:text-[var(--teal-200)] transition-colors truncate">
                            {item.judul}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-[var(--text3)]">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </Link>

                        {/* Action buttons — di LUAR Link agar tidak conflict */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-0 border-[var(--dark3)]">
                          <button
                            type="button"
                            onClick={(e) => confirmDelete(e, item.id)}
                            className="p-2 text-[var(--text3)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus riwayat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/kultum/hasil/${item.id}`}
                            className="flex items-center gap-1 text-xs font-bold text-[var(--teal-200)] group-hover:translate-x-1 transition-transform"
                          >
                            Buka <PlayCircle className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--dark2)] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text1)] mb-2">Hapus Kultum?</h3>
            <p className="text-sm text-[var(--text2)] mb-6">
              Kultum ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-xl border border-[var(--gold-border)] text-[var(--text2)] text-sm font-bold hover:bg-[var(--dark3)] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
