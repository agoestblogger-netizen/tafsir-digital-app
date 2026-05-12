import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import OpenAI from "openai"
import { getBySlug } from '@/data/kaum_lampau_list'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'slug wajib' }, { status: 400 })
    }

    const config = getBySlug(slug)
    if (!config) {
      return NextResponse.json({ error: 'Kisah tidak ditemukan' }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()

    // ── STEP 1: Cek DB ──
    console.log('[Kisah] Checking DB for slug:', slug)
    let existing = null;
    try {
      const { data, error } = await supabase
        .from('kaum_lampau')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      
      console.log('[Kisah] DB result:', data ? 'FOUND' : 'NOT FOUND', error || '')
      
      if (error) throw error;
      existing = data;
    } catch (err) {
      console.error(`[Kisah] Error saat cek DB untuk slug ${slug}:`, err instanceof Error ? err.message : String(err))
      // kita lanjut ke AI generation jika DB gagal tapi tidak fatal (misal tabel belum ada, RLS, dll)
    }

    if (existing) {
      console.log(`[Kisah] ✅ DB hit: ${slug}`)
      return NextResponse.json({ source: 'database', data: existing })
    }

    // ── STEP 2: Generate via AI ──
    console.log(`[Kisah] 🤖 Generating: ${slug}`)
    
    let generated: Record<string, unknown>;
    try {
      const surahList = config.surah_utama
        .map(s => `${s.surah_nama} ayat ${s.ayat_range}`)
        .join(', ')

      const prompt = `Kamu adalah ahli tafsir Al-Qur'an yang berpengalaman. 
Tulis kisah "${config.nama}" dari Al-Qur'an secara LENGKAP dan TERSTRUKTUR.

SUMBER UTAMA: ${surahList}

WAJIB menggunakan format JSON berikut PERSIS:
{
  "ringkasan": "1-2 kalimat ringkasan kisah",
  "latar_belakang": "Paragraf tentang siapa mereka, di mana, kapan, dan konteks zamannya",
  "kondisi_kaum": "Paragraf tentang kondisi moral, sosial, dan spiritual kaum/tokoh ini",
  "kisah_lengkap": "Kisah lengkap 3-5 paragraf, mengacu pada ayat Al-Qur'an dengan menyebut surah dan nomor ayat. Contoh: 'Sebagaimana disebutkan dalam QS. Al-A\\'raf: 65, ...'",
  "azab_atau_kejadian": "Paragraf tentang azab yang menimpa (jika kaum diazab) atau kejadian luar biasa (jika kisah pilihan/nabi). Null jika tidak relevan.",
  "pelajaran": "3-5 poin pelajaran dan hikmah yang bisa diambil, dalam format paragraf",
  "ayat_utama": [
    {
      "surah_id": 7,
      "surah_nama": "Al-A\\'raf",
      "nomor_ayat": "103",
      "teks_arab": "ثُمَّ أَرْسَلْنَا مُوسَىٰ وَأَخَاهُ هَارُونَ بِآيَاتِنَا",
      "terjemah": "Kemudian Kami utus Musa dan saudaranya Harun dengan membawa ayat-ayat Kami",
      "link": "/surah/7#ayat-103"
    }
  ],
  "semua_surah": [
    {
      "surah_id": 7,
      "surah_nama": "Al-A\\'raf",
      "ayat_range": "65-72",
      "konteks": "Kisah Nabi Hud dan kaum Ad"
    }
  ],
  "referensi": "Tafsir Ibnu Katsir, Tafsir Al-Misbah (Quraish Shihab), Tafsir Al-Qurthubi"
}

ATURAN KETAT:
- Semua informasi HARUS bersumber dari Al-Qur'an dan tafsir mu'tabar
- Setiap klaim harus disertai referensi surah dan ayat
- Jangan mengarang informasi yang tidak ada dalam Al-Qur'an
- Pilih 2-3 ayat paling representatif untuk ayat_utama
- WAJIB: Field teks_arab harus diisi dengan teks Arab asli dari ayat tersebut.
- WAJIB: Field terjemah harus diisi dengan terjemahan Indonesia yang lengkap.
- JANGAN kosongkan field teks_arab atau terjemah.
- Output HANYA JSON, tanpa teks lain, tanpa markdown backticks`

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 30000)
      )

      const aiCall = openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Kamu adalah AI yang menghasilkan output JSON." },
          { role: "user", content: prompt },
        ],
      })

      const completion = await Promise.race([
        aiCall,
        timeoutPromise,
      ]) as import('openai').ChatCompletion

      const responseText = completion.choices[0].message.content || "{}"

      try {
        generated = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('[Kisah] JSON parse error:', responseText.slice(0, 200))
        throw new Error('Gagal parse response AI: ' + (parseErr instanceof Error ? parseErr.message : String(parseErr)))
      }
    } catch (aiErr) {
      console.error(`[Kisah] Error saat generate AI untuk slug ${slug}:`, aiErr instanceof Error ? aiErr.message : String(aiErr))
      throw aiErr; // Lempar ke global catch
    }

    // ── STEP 3: Simpan ke DB ──
    const insertData = {
      slug,
      nama: config.nama,
      nama_arab: config.nama_arab,
      kategori: config.kategori,
      periode: config.periode || null,
      lokasi: config.lokasi || null,
      nabi_diutus: config.nabi_diutus || null,
      ringkasan: generated.ringkasan as string,
      latar_belakang: generated.latar_belakang as string,
      kondisi_kaum: generated.kondisi_kaum as string,
      kisah_lengkap: generated.kisah_lengkap as string,
      azab_atau_kejadian: generated.azab_atau_kejadian as string | null,
      pelajaran: generated.pelajaran as string,
      ayat_utama: generated.ayat_utama || [],
      semua_surah: generated.semua_surah || config.surah_utama,
      referensi: generated.referensi as string,
    }

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('kaum_lampau')
        .insert(insertData)
        .select()
        .single()

      if (insertErr) {
        console.error('[Kisah] Insert FAILED:', JSON.stringify(insertErr))
      } else {
        console.log('[Kisah] Insert SUCCESS, id:', inserted?.id)
      }
    } catch (insertErr) {
      console.log('[Kisah] Insert result: ERROR:', insertErr instanceof Error ? insertErr.message : String(insertErr))
      console.error(`[Kisah] Exception saat insert DB untuk slug ${slug}:`, insertErr instanceof Error ? insertErr.message : String(insertErr))
    }

    return NextResponse.json({ source: 'ai_generated', data: insertData })

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const errStack = error instanceof Error ? error.stack : ''
    console.error('[Kisah] Error:', errMsg)
    console.error('[Kisah] Stack:', errStack)
    return NextResponse.json({ 
      error: 'Internal error', 
      detail: errMsg  // tampilkan detail di development
    }, { status: 500 })
  }
}
