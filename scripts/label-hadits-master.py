import os
import time, json
from supabase import create_client
from openai import OpenAI

supabase = create_client("https://crrcijfzujegmeuaffvl.supabase.co", "sb_secret_BKZ_-BlfRXG_0CDhJQDZ1g_b_ffaRLN")
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

TOPIK_LIST = [
    "Iman & Akidah", "Tauhid Uluhiyah", "Ibadah & Shalat", "Puasa & Ramadan",
    "Zakat & Sedekah", "Haji & Umrah", "Thaharah & Kebersihan", "Halal & Haram",
    "Akhlak Mulia", "Kejujuran & Amanah", "Birrul Walidain", "Keluarga",
    "Pernikahan & Rumah Tangga", "Mendidik Anak", "Ukhuwah & Persaudaraan",
    "Sabar & Syukur", "Tawakkal", "Ikhlas & Niat", "Taubat & Ampunan",
    "Ilmu & Pendidikan", "Dakwah & Amar Makruf", "Kepemimpinan & Amanah",
    "Rezeki & Kerja", "Dermawan & Sedekah", "Akhirat & Kiamat", "Doa & Dzikir",
    "Kematian", "Jihad & Perjuangan", "Sirah Nabawiyah", "Adab & Sopan Santun",
]

def label_batch(hadits_list):
    texts = [f"{i}. {(h.get('matan') or h.get('terjemah',''))[:200]}" for i, h in enumerate(hadits_list)]
    prompt = "Untuk setiap hadits berikut, pilih topik utama dan 1-3 tags dari daftar: " + ", ".join(TOPIK_LIST)
    prompt += "\n\nHadits:\n" + "\n".join(texts)
    prompt += '\n\nJawab HANYA JSON array: [{"index": 0, "topik": "Topik Utama", "tags": ["tag1", "tag2"]}, ...]'
    
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1500,
        temperature=0.1,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = resp.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(raw)

total_labeled = 0
BATCH = 20
offset = 0

while True:
    result = supabase.table("hadits_master").select("id, terjemah, matan").eq("perawi", "bukhari").is_("topik_nama", "null").range(offset, offset+BATCH-1).execute()
    if not result.data:
        break
    batch = result.data
    try:
        labels = label_batch(batch)
        for label in labels:
            idx = label.get("index", 0)
            if idx < len(batch):
                supabase.table("hadits_master").update({
                    "topik_nama": label.get("topik", ""),
                    "tags": label.get("tags", [])
                }).eq("id", batch[idx]["id"]).execute()
        total_labeled += len(batch)
        print(f"Labeled: {total_labeled}", flush=True)
    except Exception as e:
        print(f"Error batch: {e}", flush=True)
        offset += BATCH
    time.sleep(0.5)

print(f"DONE! Total: {total_labeled}", flush=True)
