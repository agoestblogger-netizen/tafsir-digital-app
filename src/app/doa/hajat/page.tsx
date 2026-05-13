"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, ArrowRight } from 'lucide-react'
import { HAJAT_INFO, TemaHajat, getByHajat } from '@/data/doa_qurani'

export default function HajatIndexPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--gold-border)]">
        <div className="arabesque-bg opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <button onClick={() => router.push('/doa')} className="flex items-center gap-2 text-[var(--text2)] hover:text-[var(--gold-light)] mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-6 h-6 text-[var(--gold)]" />
            <h1 className="text-3xl md:text-4xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]">
              Doa Berdasarkan Hajat
            </h1>
          </div>
          <p className="text-[var(--text2)] text-sm md:text-base max-w-2xl">
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
                    <span className="text-xs font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                      {count} Doa
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[var(--text1)] mb-1 group-hover:text-[var(--teal-200)] transition-colors">
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
