"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KultumResultView } from '@/components/specific/KultumResultView'
import { KhotbahJumatView, KhotbahJumatOutput } from '@/components/specific/KhotbahJumatView'
import { KultumOutput } from '@/app/api/kultum-generator/route'
import { Loader2 } from 'lucide-react'
import { resolveAyatPlaceholders } from '@/lib/resolve-ayat-placeholders'
import { BackButton } from '@/components/ui/BackButton'

export default function KultumPreviewPage() {
  const router = useRouter()
  const [konten, setKonten] = useState<KultumOutput | null>(null)
  const [referensiDipilih, setReferensiDipilih] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const dataStr = sessionStorage.getItem('kultum_result')
      const refStr = sessionStorage.getItem('kultum_referensi_dipilih')
      if (refStr) {
        try {
          setReferensiDipilih(JSON.parse(refStr))
        } catch (e) {
          console.error('Failed to parse preview references', e)
        }
      }

      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr)

          // Normalisasi jika menggunakan format Kisah Baru
          if (parsed.pembuka || parsed.ayat_pendukung || parsed.penjabaran) {
            parsed.bagian = {
              doa_pembuka: {
                arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
                terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu.",
                sumber: "HR. Tirmidzi"
              },
              pembuka: {
                salam: "Assalamu'alaikum warahmatullahi wabarakatuh.",
                muqaddimah: parsed.pembuka?.teks || "",
                pengantar_tema: ""
              },
              ayat_quran: (parsed.ayat_pendukung ?? []).map((a: any) => ({
                arab: a.teks_arab ?? "",
                latin: a.latin ?? "",
                terjemah: a.terjemah ?? "",
                referensi: a.sumber ?? "",
                tafsir_singkat: ""
              })),
              penjabaran_tafsir: parsed.penjabaran?.teks || "",
              penekanan_makna: parsed.penekanan_makna?.teks || "",
              poin_utama: (parsed.poin_utama ?? []).map((p: any) => ({
                judul: p.judul ?? "",
                isi: p.teks ?? ""
              })),
              kesimpulan: parsed.kesimpulan?.teks || "",
              doa_penutup_majelis: {
                arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
                terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu."
              }
            }
            parsed.durasi_estimasi = `${parsed.durasi_menit ?? 10} Menit`
          }

          // Resolve sisa placeholder yang belum ter-resolve (fallback)
          await resolveAyatPlaceholders(parsed)
          setKonten(parsed)
        } catch (e) {
          console.error('Failed to parse preview data', e)
        }
      }
      setLoading(false)
    }
    load()
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
        <BackButton label="Kembali ke Generator" overrideUrl="/kultum" />
      </div>
    )
  }

  if (konten.format === 'khotbah_jumat') {
    return (
      <KhotbahJumatView 
        konten={konten as unknown as KhotbahJumatOutput} 
        isSaved={false}
        referensiDipilih={referensiDipilih}
      />
    )
  }

  return (
    <KultumResultView 
      konten={konten} 
      isSaved={false} // user is not logged in or data is just temporary
      referensiDipilih={referensiDipilih}
    />
  )
}
