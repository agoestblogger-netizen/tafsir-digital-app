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

          let ayatQuranDb: any[] = []
          let haditsDb: any[] = []
          if (refStr) {
            try {
              const parsedRefs = JSON.parse(refStr)
              if (Array.isArray(parsedRefs)) {
                ayatQuranDb = parsedRefs.filter((r: any) => r.type === 'ayat_quran_db').map((a: any) => ({
                  arab: a.data?.teks_arab ?? a.arab ?? a.data?.arab ?? '',
                  latin: a.data?.teks_latin ?? a.latin ?? a.data?.latin ?? '',
                  terjemah: a.data?.terjemah ?? a.terjemah ?? '',
                  referensi: a.judul ?? a.referensi ?? '',
                  surah_id: a.data?.surah_id,
                  nomor_ayat: a.data?.nomor_ayat,
                  surah_nama: a.data?.surah_nama_latin ?? a.data?.surah_nama ?? '',
                  is_resolved: true
                }))

                haditsDb = parsedRefs.filter((r: any) => r.type === 'hadits').map((h: any) => ({
                  arab: h.data?.arab ?? h.arab ?? h.data?.matan ?? h.matan ?? '',
                  latin: h.data?.latin ?? h.latin ?? '',
                  terjemah: h.data?.terjemah ?? h.terjemah ?? h.data?.matan_indo ?? h.matan_indo ?? '',
                  referensi: h.judul ?? h.referensi ?? (h.data?.perawi && h.data?.nomor ? `HR. ${h.data.perawi} No. ${h.data.nomor}` : ''),
                  perawi: h.data?.perawi ?? h.perawi ?? '',
                  nomor: h.data?.nomor ?? h.nomor ?? '',
                  syarah: h.data?.topik_nama ?? h.topik_nama ?? h.data?.bab ?? h.bab ?? h.data?.syarah ?? h.syarah ?? ''
                }))
              }
            } catch (e) {
              console.error('Failed to parse preview references for ayat/hadits injection', e)
            }
          }

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
              ayat_quran: [
                ...(parsed.ayat_pendukung ?? []).map((a: any) => ({
                  arab: a.teks_arab ?? "",
                  latin: a.latin ?? "",
                  terjemah: a.terjemah ?? "",
                  referensi: a.sumber ?? "",
                  tafsir_singkat: ""
                })),
                ...ayatQuranDb
              ],
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
          } else if (parsed.isi && Array.isArray(parsed.isi)) {
            // Format baru: isi array dengan referensi_id per poin
            parsed.bagian = {
              doa_pembuka: {
                arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
                terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu.",
                sumber: "HR. Tirmidzi"
              },
              pembuka: {
                salam: "",
                muqaddimah: parsed.isi[0]?.paragraf ?? "",
                pengantar_tema: ""
              },
              ayat_quran: ayatQuranDb,
              hadits_pendukung: haditsDb,
              isi: parsed.isi,
              penekanan_makna: parsed.penekanan_makna ?? "",
              kesimpulan: parsed.kesimpulan ?? "",
              ajakan_penutup: parsed.ajakan_penutup ?? "",
              doa_penutup_majelis: {
                arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
                terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu."
              }
            }
            parsed.durasi_estimasi = `${parsed.durasi_menit ?? 10} Menit`
            parsed.gaya_bahasa = parsed.gaya_bahasa ?? 'Semi-Formal'
            parsed.tema = parsed.tema ?? ''

            const isiAll = parsed.isi
            const isiTengah = isiAll.length > 2 ? isiAll.slice(1, -1) : isiAll
            parsed.bagian.poin_utama = isiTengah
              .map((item: any) => ({
                judul: item.judul ?? '',
                isi: item.paragraf ?? item.text ?? item.isi ?? '',
                referensi_id: item.referensi_id
              }))
              .filter((p: any) => p.isi?.trim())

            if (isiAll[0]) {
              parsed.bagian.pembuka.pengantar_tema =
                isiAll[0].paragraf ?? isiAll[0].text ?? isiAll[0].isi ?? ''
            }

            parsed.bagian.penutup = {
              kesimpulan: parsed.kesimpulan ?? (isiAll[isiAll.length - 1]?.paragraf ?? isiAll[isiAll.length - 1]?.text ?? ''),
              ajakan: parsed.ajakan_penutup ?? '',
              doa_penutup_konten: parsed.doa_penutup ?? ''
            }
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
