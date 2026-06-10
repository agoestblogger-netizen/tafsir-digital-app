import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RefItem {
  type: string;
  judul: string;
  data?: any;
}

function getRingkasanRef(ref: RefItem): string {
  const d = ref.data ?? ref;
  const teks = ref.type === "hadits"
    ? (d.matan ?? d.terjemah ?? "")
    : (d.terjemah ?? d.matan_indo ?? d.teks ?? "");
  const label = ref.type === "ayat_quran_db" ? "Ayat Al-Qur'an" :
                ref.type === "hadits" ? "Hadits" :
                ref.type === "doa_quran" ? "Doa" : "Referensi";
  const sumber = ref.type === "ayat_quran_db"
    ? `QS. ${d.surah_nama_latin ?? d.surah_nama ?? ""}: ${d.nomor_ayat ?? ""}`
    : ref.type === "hadits"
    ? `HR. ${d.perawi ?? ""} No. ${d.nomor ?? ""}`
    : ref.judul ?? "";
  return `[${label}] "${teks.slice(0, 200)}" — ${sumber}`;
}

async function generatePenjabaran(
  ref: RefItem,
  tema: string,
  gaya: string,
  kataPerRef: number,
  maxTokens: number
): Promise<string> {
  const ringkasan = getRingkasanRef(ref);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `Kamu adalah ustadz yang sedang berceramah. Tulis penjabaran sekitar ${kataPerRef} kata (gaya: ${gaya}) yang SPESIFIK menjelaskan ISI referensi berikut dalam konteks tema "${tema}".
PENTING:
- Penjabaran HARUS membahas isi spesifik dari referensi tersebut — tokoh, peristiwa, atau pesan utama yang disebutkan
- Jangan bicara tema secara umum — gali makna dari KONTEN referensi itu sendiri
- Tulis dalam gaya ceramah lisan yang mengalir dan menyentuh hati
- JANGAN menulis teks Arab atau transliterasi
- JANGAN sebut "referensi" atau "dalil" — langsung jelaskan maknanya
- Output hanya teks penjabaran saja, tanpa label apapun`
      },
      {
        role: "user",
        content: `Referensi: ${ringkasan}`
      }
    ]
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

async function generateJembatan(refSekarang: RefItem, refBerikut: RefItem, penjabaranSekarang: string, tema: string, gaya: string): Promise<string> {
  const labelBerikut = refBerikut.type === "ayat_quran_db" ? "firman Allah dalam Al-Qur'an" :
                       refBerikut.type === "hadits" ? "sabda Rasulullah SAW" :
                       "doa yang diajarkan";
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 150,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `Kamu adalah ustadz yang sedang berceramah. Tulis 1-2 kalimat narasi jembatan yang menghubungkan penjabaran sebelumnya dengan referensi berikutnya (${labelBerikut}).
PENTING:
- Kalimat harus mengalir natural dari penjabaran sebelumnya
- Gunakan variasi frasa penghubung yang natural dan tidak monoton, seperti:
  "Dan hal ini diperkuat oleh...", "Senada dengan itu...", "Bahkan Allah SWT juga menegaskan...", 
  "Rasulullah SAW pun menjelaskan hal ini...", "Lebih jauh lagi, Allah mengingatkan kita...",
  "Hal ini sejalan dengan apa yang diajarkan...", "Dan sebagai penguat, marilah kita renungkan...",
  "Imam besar kita pun menasehatkan...", "Perhatikanlah pula firman Allah berikut ini...",
  "Dan untuk memperkuat keyakinan kita, Rasulullah SAW bersabda..."
- JANGAN selalu gunakan frasa yang sama — variasikan setiap kali"
- Gaya bahasa: ${gaya}
- Output hanya kalimat jembatan saja, tanpa label`
      },
      {
        role: "user",
        content: `Penjabaran sebelumnya: "${penjabaranSekarang}"\n\nReferensi berikutnya: ${getRingkasanRef(refBerikut)}`
      }
    ]
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { referensi_dipilih, tema, gaya_bahasa, durasi_menit } = await req.json();

    if (!referensi_dipilih || referensi_dipilih.length < 2) {
      return NextResponse.json({ error: "Minimal 2 referensi" }, { status: 400 });
    }

    const gaya = gaya_bahasa ?? "Semi-Formal";

    // Filter hanya ayat dan hadits (bukan doa — doa tetap di penutup)
    const refs: RefItem[] = referensi_dipilih.filter(
      (r: RefItem) => r.type === "ayat_quran_db" || r.type === "hadits"
    );

    if (refs.length === 0) {
      return NextResponse.json({ error: "Tidak ada ayat/hadits untuk interleaved" }, { status: 400 });
    }

    // Hitung panjang penjabaran per referensi berdasarkan durasi
    const durasiMenit = (durasi_menit as number) ?? 7;
    const kataPerRef = Math.round((durasiMenit * 150 * 0.65) / refs.length);
    const maxTokensPenjabaran = Math.min(1500, Math.max(300, kataPerRef * 2));

    // Sequential chained generation
    const bagian: string[] = [];

    for (let i = 0; i < refs.length; i++) {
      // Generate penjabaran untuk referensi ini
      const penjabaran = await generatePenjabaran(refs[i], tema, gaya, kataPerRef, maxTokensPenjabaran);
      bagian.push(penjabaran);

      // Generate narasi jembatan ke referensi berikutnya (kecuali yang terakhir)
      if (i < refs.length - 1) {
        const jembatan = await generateJembatan(refs[i], refs[i + 1], penjabaran, tema, gaya);
        // Tandai sebagai jembatan dengan prefix khusus
        bagian.push(`[[JEMBATAN]] ${jembatan}`);
      }
    }

    // Susun teks final dengan marker [[REF:N]]
    let hasil = "";
    let refIdx = 0;
    for (const b of bagian) {
      if (b.startsWith("[[JEMBATAN]]")) {
        hasil += "\n\n" + b.replace("[[JEMBATAN]] ", "") + " [[REF:" + refIdx + "]]\n\n";
        refIdx++;
      } else {
        hasil += b;
      }
    }

    // Tambah [[REF:0]] setelah penjabaran pertama jika belum ada
    // (untuk refs[0] marker ada sebelum penjabaran refs[1])
    // Rekonstruksi: narasi[0] [[REF:0]] jembatan narasi[1] [[REF:1]] jembatan ... narasi[n]
    hasil = "";
    refIdx = 0;
    const penjabaranList: string[] = [];
    const jembatanList: string[] = [];

    for (const b of bagian) {
      if (b.startsWith("[[JEMBATAN]]")) {
        jembatanList.push(b.replace("[[JEMBATAN]] ", ""));
      } else {
        penjabaranList.push(b);
      }
    }

    // Format: [[REF:0]] penjabaran[0] jembatan[0] [[REF:1]] penjabaran[1] jembatan[1] ... [[REF:n]] penjabaran[n]
    for (let i = 0; i < refs.length; i++) {
      // Card referensi dulu
      hasil += (i === 0 ? "" : "\n\n") + "[[REF:" + i + "]]";
      // Lalu penjabaran
      if (penjabaranList[i]) {
        hasil += "\n\n" + penjabaranList[i];
      }
      // Lalu jembatan ke referensi berikutnya
      if (jembatanList[i]) {
        hasil += "\n\n" + jembatanList[i];
      }
    }

    return NextResponse.json({
      penjabaran_interleaved: hasil.trim(),
      ref_count: refs.length
    });

  } catch (err) {
    console.error("[build-interleaved] Error:", err);
    return NextResponse.json({ error: "Error server" }, { status: 500 });
  }
}
