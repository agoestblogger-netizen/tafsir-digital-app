import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { PERAWI_LIST } from '@/lib/api/hadits'
import OpenAI from 'openai'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!
})

// Whitelist ulama yang BOLEH disebut AI
const WHITELIST_ULAMA = {
  bukhari: {
    ulama: 'Ibnu Hajar Al-Asqalani',
    kitab: 'Fathul Bari',
  },
  muslim: {
    ulama: 'Imam An-Nawawi',
    kitab: 'Al-Minhaj Syarh Shahih Muslim',
  },
  tirmidzi: {
    ulama: 'Al-Mubarakfuri',
    kitab: 'Tuhfatul Ahwadzi',
  },
  'abu-dawud': {
    ulama: 'Abu Thayyib Al-Adzim Abadi',
    kitab: "Aunul Ma'bud",
  },
  nasai: {
    ulama: 'As-Suyuthi',
    kitab: "Syarah Sunan An-Nasa'i",
  },
  'ibnu-majah': {
    ulama: 'As-Sindi',
    kitab: 'Syarah Sunan Ibnu Majah',
  },
  ahmad: {
    ulama: 'Ibnu Rajab Al-Hanbali',
    kitab: 'Jami Al-Ulum wal Hikam',
  },
  malik: {
    ulama: 'Az-Zarqani',
    kitab: "Syarah Muwatha' Malik",
  },
  darimi: {
    ulama: 'Imam Ad-Darimi',
    kitab: 'Muqaddimah Sunan Ad-Darimi',
  },
}

export async function POST(req: Request) {
  try {
    const { perawi, nomor, arab, terjemah, mode } = await req.json()
    // mode: 'resume' | 'penjelasan'

    const supabase = getSupabaseAdmin()

    // Cek cache Supabase dulu
    const { data: cached, error: cacheError } = await supabase
      .from('hadits_cache')
      .select('resume, penjelasan_ulama')
      .eq('perawi', perawi)
      .eq('nomor', nomor)
      .single()

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Supabase cache check error:', cacheError)
    }

    if (mode === 'resume' && cached?.resume) {
      return NextResponse.json({ result: cached.resume })
    }
    if (mode === 'penjelasan' && cached?.penjelasan_ulama) {
      return NextResponse.json({ result: cached.penjelasan_ulama })
    }

    const ulamaInfo = WHITELIST_ULAMA[perawi as keyof typeof WHITELIST_ULAMA]

    // Generate dengan AI
    const prompt = mode === 'resume'
      ? `Berikut adalah hadits dari ${perawi}:

Teks Arab: ${arab}
Terjemahan: ${terjemah}

Tugas kamu: Buat RESUME SINGKAT hadits ini dalam 2-3 kalimat bahasa Indonesia yang:
1. Menjelaskan INTI PESAN hadits dengan jelas
2. Menyebutkan konteks atau siapa yang terlibat jika relevan
3. Menjelaskan hikmah atau pelajaran utama
4. TIDAK menambahkan informasi yang tidak ada di teks
5. TIDAK menyebut nama ulama atau kitab apapun

Format: Paragraf singkat, tanpa poin-poin, tanpa judul.
Langsung tulis resumenya:`

      : `Berikut adalah hadits dari ${perawi} No. ${nomor}:

Terjemahan: ${terjemah}

Tugas kamu: Buat penjelasan singkat hadits ini (3-4 paragraf) yang:
1. Menjelaskan konteks dan sebab wurud (latar belakang) hadits jika diketahui
2. ${ulamaInfo ? `Merujuk penjelasan ${ulamaInfo.ulama} dalam kitab ${ulamaInfo.kitab} secara UMUM — DILARANG mengklaim kutipan langsung atau nomor halaman` : 'Menjelaskan pandangan umum ulama'}
3. Menjelaskan kandungan hukum atau hikmah secara umum
4. DILARANG keras: membuat kutipan palsu, menyebut ulama selain ${ulamaInfo?.ulama || 'ulama yang relevan'}, mengklaim nomor halaman/jilid spesifik
5. Akhiri dengan: "Wallahu a'lam bishawab."

DISCLAIMER WAJIB di awal: Mulai dengan "[Rangkuman AI]"

Format: Paragraf mengalir, bahasa Indonesia yang baik.
Langsung tulis penjelasannya:`

    // Fetch ke AI (gunakan OpenAI)
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set')
      return NextResponse.json({ error: 'AI config error' }, { status: 500 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: mode === 'resume' ? 300 : 1000,
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content || ''

    if (result) {
      // Simpan ke Supabase cache
      const perawiData = PERAWI_LIST.find(p => p.id === perawi)
      const { error: upsertError } = await supabase.from('hadits_cache').upsert({
        perawi,
        nomor,
        arab,
        terjemah,
        grade: perawiData?.level || 'Shahih',
        [mode === 'resume' ? 'resume' : 'penjelasan_ulama']: result,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'perawi,nomor' })

      if (upsertError) {
        console.error('Supabase cache upsert error:', upsertError)
      }
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Internal server error in hadits-ai:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


