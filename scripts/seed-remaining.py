import requests, time
from supabase import create_client

headers = {'User-Agent': 'Mozilla/5.0'}
supabase = create_client("https://crrcijfzujegmeuaffvl.supabase.co", "sb_secret_BKZ_-BlfRXG_0CDhJQDZ1g_b_ffaRLN")

KITAB_LIST = [
    {'id': 'tirmidzi', 'total': 3625},
    {'id': 'nasai', 'total': 5761},
    {'id': 'ibnu-majah', 'total': 4285},
    {'id': 'malik', 'total': 1587},
    {'id': 'ahmad', 'total': 4305},
    {'id': 'darimi', 'total': 2949},
    {'id': 'riyadhus-shalihin', 'total': 371},
]

for kitab in KITAB_LIST:
    perawi = kitab['id']
    total = kitab['total']
    existing = set([r['nomor'] for r in supabase.table('hadits_master').select('nomor').eq('perawi', perawi).execute().data])
    remaining = [n for n in range(1, total+1) if n not in existing]
    if not remaining:
        print(f'{perawi}: sudah lengkap', flush=True)
        continue
    print(f'Seeding {perawi}: {len(remaining)}...', flush=True)
    batch, success, fail = [], 0, 0
    for i, nomor in enumerate(remaining):
        try:
            resp = requests.get(f'https://api.myquran.com/v2/hadits/{perawi}/{nomor}', headers=headers, timeout=10)
            if resp.status_code == 200:
                d = resp.json()['data']
                batch.append({'nomor': nomor, 'perawi': perawi, 'kitab': '', 'bab': '', 'arab': d.get('arab',''), 'matan': '', 'terjemah': d.get('id','')})
                success += 1
            else:
                fail += 1
            if len(batch) >= 50:
                supabase.table('hadits_master').insert(batch).execute()
                batch = []
            if (i+1) % 500 == 0:
                print(f'  {perawi}: {i+1}/{len(remaining)} ok={success} fail={fail}', flush=True)
            time.sleep(0.15)
        except Exception as e:
            fail += 1
    if batch:
        supabase.table('hadits_master').insert(batch).execute()
    print(f'  {perawi} DONE ok={success} fail={fail}', flush=True)

print('SEMUA SELESAI!', flush=True)
