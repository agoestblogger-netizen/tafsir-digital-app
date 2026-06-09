import os, json, re
from concurrent.futures import ThreadPoolExecutor, as_completed
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

BATCH = 30
WORKERS = 8
TOPIK_STR = ", ".join(TOPIK_LIST)

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
            return match.group(1).strip()[:250]
    return teks[-200:].strip()

def fetch_all_unlabeled(perawi):
    import time as _t
    rows = []
    page = 0
    while True:
        for attempt in range(5):
            try:
                result = (
                    supabase.table("hadits_master")
                    .select("id, terjemah, matan")
                    .eq("perawi", perawi)
                    .is_("topik_nama", "null")
                    .range(page * 1000, page * 1000 + 999)
                    .execute()
                )
                break
            except Exception as e:
                print("  fetch retry " + str(attempt+1) + ": " + str(e)[:50], flush=True)
                _t.sleep(3)
        else:
            print("  fetch gagal 5x, skip page", flush=True)
            break
        data = result.data or []
        rows.extend(data)
        if len(data) < 1000:
            break
        page += 1
    return rows

def label_batch(batch):
    texts = []
    for i, h in enumerate(batch):
        raw = h.get("matan") or h.get("terjemah", "")
        texts.append(str(i) + ". " + strip_sanad(raw)[:200])
    prompt = (
        "Untuk setiap hadits berikut, pilih topik utama dan 1-3 tags dari daftar: "
        + TOPIK_STR
        + "\n\nHadits:\n"
        + "\n".join(texts)
        + '\n\nWAJIB jawab untuk SEMUA index 0 sampai '
        + str(len(batch) - 1)
        + '. Jawab HANYA JSON array: [{"index": 0, "topik": "Sabar & Syukur", "tags": ["Doa & Dzikir"]}]'
    )
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=3000,
            temperature=0.1,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = resp.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()
        labels = json.loads(raw)
    except Exception:
        labels = []
    by_idx = {}
    for lab in labels:
        idx = lab.get("index", -1)
        if 0 <= idx < len(batch) and lab.get("topik"):
            by_idx[idx] = (lab.get("topik"), lab.get("tags", []))
    out = []
    for i, h in enumerate(batch):
        if i in by_idx:
            topik, tags = by_idx[i]
        else:
            topik, tags = "Iman & Akidah", []
        out.append({"id": h["id"], "topik_nama": topik, "tags": tags})
    return out

def bulk_update(updates):
    # Satu RPC call untuk semua row sekaligus
    supabase.rpc("bulk_label_hadits", {"updates": updates}).execute()

def process_perawi(perawi):
    print("\n=== " + perawi.upper() + " ===", flush=True)
    rows = fetch_all_unlabeled(perawi)
    print("  " + str(len(rows)) + " unlabeled", flush=True)
    if not rows:
        print("  skip", flush=True)
        return 0
    batches = [rows[i:i + BATCH] for i in range(0, len(rows), BATCH)]
    total = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(label_batch, b): b for b in batches}
        for fut in as_completed(futures):
            updates = fut.result()
            bulk_update(updates)
            total += len(updates)
            print("  " + perawi + ": " + str(total) + "/" + str(len(rows)), flush=True)
    print("  " + perawi + " DONE: " + str(total), flush=True)
    return total

grand = 0
for perawi in PERAWI_LIST:
    grand += process_perawi(perawi)
print("\nSEMUA SELESAI: " + str(grand), flush=True)
