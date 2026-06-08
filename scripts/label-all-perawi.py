import os
import time, json, sys, re
from supabase import create_client
from openai import OpenAI

supabase = create_client("https://crrcijfzujegmeuaffvl.supabase.co", "sb_secret_BKZ_-BlfRXG_0CDhJQDZ1g_b_ffaRLN")
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

TOPIK_LIST = [
    "Akhirat & Kiamat", "Akhlak Mulia", "Amal di Bulan Ramadan",
    "Birrul Walidain", "Doa & Dzikir", "Haji & Umrah",
    "Idul Fitri & Silaturahmi", "Ilmu & Pendidikan", "Iman & Akidah",
    "Isra' Mi'raj", "Istiqomah & Konsisten", "Kejujuran & Amanah",
    "Keluarga", "Kepemimpinan & Keadilan", "Kesehatan & Thibbun Nabawi",
    "Kesehatan Jiwa & Qalbu", "Kisah Para Nabi", "Memaafkan & Menahan Marah",
    "Mendidik Anak", "Menjaga Lisan", "Muamalah & Jual Beli",
    "Muhasabah & Introspeksi", "Optimisme & Harapan",
    "Penciptaan & Tanda Kebesaran Allah", "Pernikahan & Rumah Tangga",
    "Puasa & Ramadan", "Rezeki & Kerja", "Sabar & Syukur", "Shalat",
    "Sosial & Masyarakat", "Taubat & Ampunan", "Tawadhu & Rendah Hati",
    "Ukhuwah & Persaudaraan", "Zakat & Sedekah",
]

PERAWI_LIST = [
    "muslim", "arbain-nawawi", "bulughul-maram",
    "tirmidzi", "abu-dawud", "nasai", "ibnu-majah",
    "malik", "ahmad", "darimi", "riyadhus-shalihin",
]

BATCH = 10

def strip_sanad(teks):
    if not teks:
        return ""
    patterns = [
        r'bahwa Rasulullah[^:]*:?\s*["\u201c]?(.+)',
        r'bersabda\s*[:\u201c"]?\s*(.+)',
        r'berkata\s*[:\u201c"]?\s*(.+)',
        r'\]\s*bahwa\s*(.+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, teks, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1).strip()[:300]
    return teks[-200:].strip()

def label_batch(hadits_list):
    texts = []
    for i, h in enumerate(hadits_list):
        raw = h.get('matan') or h.get('terjemah', '')
        teks = strip_sanad(raw)
        texts.append(f"{i}. {teks[:200]}")
    prompt = (
        "Untuk setiap hadits berikut, pilih topik utama dan 1-3 tags dari daftar: "
        + ", ".join(TOPIK_LIST)
        + "\n\nHadits:\n"
        + "\n".join(texts)
        + '\n\nJawab HANYA JSON array: [{"index": 0, "topik": "Topik Utama", "tags": ["tag1", "tag2"]}, ...]'
    )
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1500,
        temperature=0.1,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = resp.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(raw)

def get_unlabeled_count(perawi):
    result = (
        supabase.table("hadits_master")
        .select("id", count="exact")
        .eq("perawi", perawi)
        .is_("topik_nama", "null")
        .execute()
    )
    return result.count or 0

def label_perawi(perawi):
    total_labeled = 0
    consecutive_errors = 0
    unlabeled = get_unlabeled_count(perawi)
    print(f"\n=== {perawi.upper()} — {unlabeled} unlabeled ===", flush=True)
    if unlabeled == 0:
        print(f"  {perawi}: sudah semua terlabel, skip.", flush=True)
        return 0
    while True:
        try:
            result = (
                supabase.table("hadits_master")
                .select("id, terjemah, matan")
                .eq("perawi", perawi)
                .is_("topik_nama", "null")
                .range(0, BATCH - 1)
                .execute()
            )
        except Exception as e:
            print(f"  Fetch error: {e}", flush=True)
            time.sleep(2)
            consecutive_errors += 1
            if consecutive_errors >= 5:
                print(f"  {perawi}: 5 consecutive errors, stopping.", flush=True)
                break
            continue
        if not result.data:
            break
        batch = result.data
        consecutive_errors = 0
        try:
            labels = label_batch(batch)
            for label in labels:
                idx = label.get("index", 0)
                if idx < len(batch):
                    supabase.table("hadits_master").update({
                        "topik_nama": label.get("topik", ""),
                        "tags": label.get("tags", []),
                    }).eq("id", batch[idx]["id"]).execute()
            total_labeled += len(batch)
            print(f"  {perawi}: +{len(batch)} labeled (session: {total_labeled})", flush=True)
        except json.JSONDecodeError as e:
            print(f"  JSON parse error: {e} — marking Uncategorized", flush=True)
            for h in batch:
                supabase.table("hadits_master").update({
                    "topik_nama": "Uncategorized", "tags": [],
                }).eq("id", h["id"]).execute()
            total_labeled += len(batch)
        except Exception as e:
            print(f"  Error: {e}", flush=True)
            consecutive_errors += 1
            if consecutive_errors >= 5:
                print(f"  {perawi}: 5 consecutive errors, stopping.", flush=True)
                break
        time.sleep(0.5)
    print(f"  {perawi} DONE — session total: {total_labeled}", flush=True)
    return total_labeled

grand_total = 0
for perawi in PERAWI_LIST:
    count = label_perawi(perawi)
    grand_total += count
    time.sleep(1)

print(f"\n============================", flush=True)
print(f"SEMUA SELESAI — Grand total: {grand_total}", flush=True)
