import os, json, re, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from supabase import create_client
from openai import OpenAI

supabase = create_client("https://crrcijfzujegmeuaffvl.supabase.co", "sb_secret_BKZ_-BlfRXG_0CDhJQDZ1g_b_ffaRLN")
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

PERAWI_LIST = [
    "bukhari", "muslim", "arbain-nawawi", "bulughul-maram",
    "tirmidzi", "abu-dawud", "nasai", "ibnu-majah",
    "malik", "ahmad", "darimi", "riyadhus-shalihin",
]

BATCH = 25
WORKERS = 8

def strip_sanad(teks):
    if not teks:
        return ""
    patterns = [
        r'bahwa Rasulullah[^:]*:?\s*["\u201c]?(.+)',
        r'bersabda\s*[:\u201c"]?\s*(.+)',
        r'berkata\s*[:\u201c"]?\s*(.+)',
        r'\]\s*bahwa\s*(.+)',
    ]
    for p in patterns:
        m = re.search(p, teks, re.IGNORECASE | re.DOTALL)
        if m:
            return m.group(1).strip()[:300]
    return teks[-250:].strip()

def fetch_paginated(perawi, select, null_col, extra_not_null=None):
    rows = []
    page = 0
    while True:
        for attempt in range(5):
            try:
                q = (supabase.table("hadits_master").select(select)
                     .eq("perawi", perawi).is_(null_col, "null"))
                if extra_not_null:
                    q = q.not_.is_(extra_not_null, "null")
                result = q.range(page*1000, page*1000+999).execute()
                break
            except Exception as e:
                print("  fetch retry " + str(attempt+1) + ": " + str(e)[:40], flush=True)
                time.sleep(3)
        else:
            break
        data = result.data or []
        rows.extend(data)
        if len(data) < 1000:
            break
        page += 1
    return rows

# ── PASS 1: INTISARI ──
def intisari_batch(batch):
    texts = []
    for i, h in enumerate(batch):
        topik = h.get("topik_nama") or ""
        isi = strip_sanad(h.get("terjemah",""))[:250]
        texts.append(str(i) + ". [" + topik + "] " + isi)
    prompt = (
        "Untuk setiap hadits, tulis INTISARI 1-2 kalimat bahasa Indonesia yang menangkap makna inti dan hikmah (bukan terjemah ulang). Padat dan kontekstual.\n\nHadits:\n"
        + "\n".join(texts)
        + '\n\nWAJIB jawab SEMUA index 0 sampai ' + str(len(batch)-1)
        + '. HANYA JSON: [{"index":0,"intisari":"..."}]'
    )
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini", max_tokens=3500, temperature=0.2,
            messages=[{"role":"user","content":prompt}])
        raw = resp.choices[0].message.content.strip().replace("```json","").replace("```","").strip()
        labels = json.loads(raw)
    except Exception:
        labels = []
    by_idx = {}
    for lab in labels:
        idx = lab.get("index", -1)
        if 0 <= idx < len(batch) and lab.get("intisari"):
            by_idx[idx] = lab.get("intisari").strip()
    out = []
    for i, h in enumerate(batch):
        intisari = by_idx.get(i) or strip_sanad(h.get("terjemah",""))[:150]
        out.append({"id": h["id"], "intisari": intisari})
    return out

def run_pass1():
    print("\n===== PASS 1: INTISARI =====", flush=True)
    for perawi in PERAWI_LIST:
        rows = fetch_paginated(perawi, "id, terjemah, topik_nama", "intisari")
        print("\n" + perawi.upper() + ": " + str(len(rows)) + " no intisari", flush=True)
        if not rows:
            continue
        batches = [rows[i:i+BATCH] for i in range(0, len(rows), BATCH)]
        total = 0
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futures = {ex.submit(intisari_batch, b): b for b in batches}
            for fut in as_completed(futures):
                updates = fut.result()
                for attempt in range(3):
                    try:
                        supabase.rpc("bulk_intisari_hadits", {"updates": updates}).execute()
                        break
                    except Exception:
                        time.sleep(2)
                total += len(updates)
                print("  " + perawi + ": " + str(total) + "/" + str(len(rows)), flush=True)
        print("  " + perawi + " DONE", flush=True)

# ── PASS 2: EMBEDDING ──
def run_pass2():
    print("\n===== PASS 2: EMBEDDING =====", flush=True)
    for perawi in PERAWI_LIST:
        rows = fetch_paginated(perawi, "id, intisari", "embedding", extra_not_null="intisari")
        print("\n" + perawi.upper() + ": " + str(len(rows)) + " no embedding", flush=True)
        if not rows:
            continue
        total = 0
        for i in range(0, len(rows), 100):
            chunk = rows[i:i+100]
            texts = [r["intisari"][:512] for r in chunk]
            try:
                resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
                updates = [{"id": r["id"], "embedding": json.dumps(emb.embedding)} for r, emb in zip(chunk, resp.data)]
                for attempt in range(3):
                    try:
                        supabase.rpc("bulk_embedding_hadits", {"updates": updates}).execute()
                        break
                    except Exception:
                        time.sleep(2)
                total += len(chunk)
                print("  " + perawi + ": " + str(total) + "/" + str(len(rows)), flush=True)
            except Exception as e:
                print("  embed error: " + str(e)[:50], flush=True)
        print("  " + perawi + " DONE", flush=True)

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "both"
    if mode in ("intisari", "both"):
        run_pass1()
    if mode in ("embed", "both"):
        run_pass2()
    print("\nSELESAI", flush=True)
