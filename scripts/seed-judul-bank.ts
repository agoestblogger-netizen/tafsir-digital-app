import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const DAFTAR_TOPIK = [
    'Tauhid Uluhiyah', 'Tauhid Rububiyah', 'Tauhid Asma wa Sifat',
    'Menghindari Syirik', 'Menghindari Bid\'ah', 'Iman kepada Allah',
    'Iman kepada Malaikat', 'Iman kepada Kitab Allah', 'Iman kepada Rasul',
    'Iman kepada Hari Akhir', 'Iman kepada Qada & Qadar',
    'Taqwa', 'Ikhlas', 'Tawakkal', 'Syukur', 'Sabar',
    'Taubat & Istighfar', 'Takut kepada Allah', 'Harapan kepada Allah',
    'Cinta kepada Allah & Rasul', 'Manhaj & Pemahaman Islam', 'Menjawab Syubhat',
    'Kejujuran', 'Amanah', 'Tawadhu', 'Dermawan & Sedekah',
    'Zuhud', 'Qanaah', 'Malu', 'Pemaaf & Menahan Marah',
    'Kasih Sayang', 'Lemah Lembut', 'Wara & Kehati-hatian', 'Muhasabah Diri',
    'Sombong & Takabur', 'Riya & Sum\'ah', 'Hasad & Dengki',
    'Dusta & Bohong', 'Ghibah & Fitnah', 'Marah & Emosi',
    'Bakhil & Kikir', 'Hubbud Dunya',
    'Birrul Walidain', 'Mendidik Anak Islami', 'Pernikahan & Pranikah',
    'Hak Suami & Istri', 'Rumah Tangga Sakinah', 'Talak & Perceraian',
    'Poligami', 'Hak Anak dalam Islam', 'Nafkah & Tanggung Jawab',
    'Hubungan dengan Mertua', 'Muslimah & Peran Wanita', 'Pacaran & Pergaulan',
    'Shalat Wajib & Rukunnya', 'Shalat Sunnah & Tahajud', 'Shalat Berjamaah',
    'Shalat Jumat', 'Thaharah & Bersuci', 'Puasa Wajib & Sunnah',
    'Ramadan & Lailatul Qadr', 'Itikaf', 'Zakat & Nisab', 'Zakat Profesi',
    'Haji & Umrah', 'Qurban & Aqiqah',
    'Ukhuwah Islamiyah', 'Silaturahmi', 'Tolong Menolong',
    'Adab Bertetangga', 'Keadilan', 'Kepemimpinan & Amanah',
    'Hak Non-Muslim', 'Adab Berbeda Pendapat',
    'Menuntut Ilmu', 'Adab Menuntut Ilmu', 'Mengajar & Berbagi Ilmu',
    'Dakwah & Amar Makruf', 'Jihad & Membela Islam', 'Sejarah Islam & Sirah',
    'Riba & Bunga Bank', 'Halal Haram Makanan', 'Jual Beli & Bisnis Islam',
    'Hutang Piutang', 'Zakat Profesi & Harta', 'Waris & Pembagiannya',
    'Wakaf & Sedekah Jariyah', 'Hukum Adat & Islam',
    'Muamalah Digital', 'Investasi & Keuangan Islam',
    'Kematian & Sakaratul Maut', 'Alam Barzakh & Kubur',
    'Hari Kiamat & Tanda-tandanya', 'Surga & Kenikmatan',
    'Neraka & Azab', 'Amal Jariyah', 'Hisab & Pertanggungjawaban',
    'Syafaat Rasulullah',
    'Media Sosial & Menjaga Lisan', 'Pergaulan & Aurat',
    'Mengatasi Kesedihan & Anxiety', 'Motivasi & Produktivitas Islam',
    'Kesehatan dalam Islam', 'Lingkungan & Alam',
    'Politik & Bernegara', 'Teknologi & Etika Islam',
    'Doa & Munajat', 'Zikir & Wirid', 'Tilawah Al-Qur\'an',
    'Keutamaan Surah-surah', 'Tafsir & Tadabur', 'Adab dengan Al-Qur\'an',
    'Isra Miraj & Momen Islam', 'Doa Mustajab & Waktu Istimewa',
    'Penyakit Hati & Penyembuhan', 'Cinta Dunia & Zuhud',
    'Muraqabah & Ihsan', 'Khusyuk dalam Ibadah',
    'Istiqamah & Konsistensi', 'Rezeki & Keberkahan Hidup'
]

const FORMAT_LIST = ['tausiyah', 'kultum', 'ceramah', 'khotbah_jumat']

const FORMAT_DESC: Record<string, string> = {
    tausiyah: 'singkat 5-10 menit, santai, untuk pengajian harian',
    kultum: 'kuliah tujuh menit, padat berisi, untuk setelah shalat',
    ceramah: 'panjang 30-45 menit, mendalam, untuk pengajian umum',
    khotbah_jumat: 'formal, untuk khatib jumat, gaya khotbah resmi'
}

async function generateJudulUntukTopik(
    topik: string,
    format: string
): Promise<string[]> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [
            {
                role: 'system',
                content: `Kamu adalah ahli konten dakwah Islam Indonesia yang kreatif.
Buat judul kultum/ceramah Islam yang menarik, relevan, dan membumi untuk masyarakat Indonesia.
Judul harus:
- Spesifik dan menarik perhatian
- Menggunakan bahasa Indonesia yang natural
- Relevan dengan kehidupan sehari-hari
- Sesuai dengan format penyampaian
- Bervariasi (tidak semua harus mulai dengan kata yang sama)
Response HANYA JSON array of 5 strings, tidak ada teks lain.`
            },
            {
                role: 'user',
                content: `Buat 5 judul untuk:
Topik: "${topik}"
Format: ${format} (${FORMAT_DESC[format]})

Contoh variasi judul yang baik:
- "Birrul Walidain: Investasi Terbaik Seorang Muslim"
- "Ketika Orang Tua Menua: Panduan Islam Merawat Mereka"
- "Ridha Allah Ada pada Ridha Orang Tua"
- "Surga di Bawah Telapak Kaki Ibu: Makna yang Sering Terlupakan"
- "Berbakti kepada Orang Tua di Era Kesibukan Modern"

Response format: ["judul1","judul2","judul3","judul4","judul5"]`
            }
        ],
        max_tokens: 500
    })

    const raw = response.choices[0].message.content ?? '[]'
    const clean = raw.replace(/```json|```/g, '').trim()

    try {
        const parsed = JSON.parse(clean)
        if (Array.isArray(parsed)) return parsed.slice(0, 5)
    } catch (e) {
        console.error('Parse error untuk topik', topik, ':', e)
    }
    return []
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
    console.log('🚀 Mulai Seed Bank Judul Kultum...')
    console.log(`📋 Total topik: ${DAFTAR_TOPIK.length}`)
    console.log(`📋 Total format: ${FORMAT_LIST.length}`)
    console.log(`📊 Target total judul: ${DAFTAR_TOPIK.length * FORMAT_LIST.length * 5}`)

    // Cek judul yang sudah ada agar bisa resume jika terputus
    const { data: existing } = await supabase
        .from('kultum_judul_bank')
        .select('topik, format')

    const sudahAda = new Set(
        (existing ?? []).map(r => `${r.topik}::${r.format}`)
    )
    console.log(`⏩ Sudah ada: ${sudahAda.size} kombinasi topik-format`)

    let totalInserted = 0
    let totalSkipped = 0
    let totalError = 0

    for (const topik of DAFTAR_TOPIK) {
        for (const format of FORMAT_LIST) {
            const key = `${topik}::${format}`

            // Skip jika sudah ada
            if (sudahAda.has(key)) {
                totalSkipped++
                continue
            }

            try {
                const judul_list = await generateJudulUntukTopik(topik, format)

                if (judul_list.length > 0) {
                    const rows = judul_list.map(judul => ({
                        topik,
                        judul,
                        format,
                        level: 'umum'
                    }))

                    const { error } = await supabase
                        .from('kultum_judul_bank')
                        .insert(rows)

                    if (error) {
                        console.error(`❌ Insert error (${topik} - ${format}):`, error.message)
                        totalError++
                    } else {
                        totalInserted += rows.length
                        console.log(`✅ ${topik} [${format}]: ${rows.length} judul`)
                    }
                }
            } catch (e) {
                console.error(`❌ Error (${topik} - ${format}):`, e)
                totalError++
            }

            // Rate limit: 500ms antar request
            await sleep(500)
        }
    }

    console.log('\n🎉 Selesai!')
    console.log(`✅ Total judul diinsert: ${totalInserted}`)
    console.log(`⏩ Total di-skip: ${totalSkipped}`)
    console.log(`❌ Total error: ${totalError}`)

    // Sample hasil
    const { data: sample } = await supabase
        .from('kultum_judul_bank')
        .select('topik, judul, format')
        .limit(5)
    console.log('\n📋 Sample hasil:')
    sample?.forEach(r => console.log(`  [${r.format}] ${r.topik}: "${r.judul}"`))
}

main().catch(console.error)