"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, ArrowRight } from 'lucide-react'
import { HAJAT_INFO, TemaHajat, getByHajat } from '@/data/doa_qurani'
import { BackButton } from '@/components/ui/BackButton'
import { useRestoreScroll } from '@/hooks/useScrollRestore'

export default function HajatIndexPage() {
  const router = useRouter()
  useRestoreScroll()

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--gold-border)]">
        <div className="arabesque-bg opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-6 h-6 text-[var(--gold)]" />
            <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-[var(--gold-light)]">
              Doa Berdasarkan Hajat
            </h1>
          </div>
          <p className="font-cairo text-sm text-[var(--text2)] max-w-2xl">
            Pilih tema atau keperluan Anda untuk menemukan doa-doa yang sesuai dari Al-Qur&apos;an.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(HAJAT_INFO) as [TemaHajat, {label: string, icon: string}][]).map(([tema, info]) => {
            const count = getByHajat(tema).length
            
            return (
              <Link key={tema} href={`/doa/hajat/${tema}`} className="block group">
                <div className="glass-card p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-[var(--gold-border)] hover:border-[var(--teal-500)] bg-[var(--dark2)] h-full flex flex-col relative overflow-hidden">
                  
                  {/* Decor */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--teal-500)]/5 rounded-full blur-2xl group-hover:bg-[var(--teal-500)]/10 transition-all"></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--dark3)] flex items-center justify-center text-2xl shadow-inner border border-[var(--gold-border)]">
                      {info.icon}
                    </div>
                    <span className="font-cairo text-xs uppercase tracking-widest font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                      {count} Doa
                    </span>
                  </div>
                  
                  <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-1 group-hover:text-[var(--teal-200)] transition-colors">
                    {info.label}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-end">
                    <ArrowRight className="w-4 h-4 text-[var(--teal-200)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
