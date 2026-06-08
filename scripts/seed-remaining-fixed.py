import time, requests
from supabase import create_client

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

def get_existing_nomor(perawi):
    """Fetch semua nomor yang sudah ada dengan pagination — fix bug limit 1000."""
    existing = set()
    page_size = 1000
    offset = 0
    while True:
        result = (
            supabase.table('hadits_master')
            .select('nomor')
            .eq('perawi', perawi)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        data = result.data or []
        for r in data:
            existing.add(r['nomor'])
        if len(data) < page_size:
            break
        offset += page_size
    return existing

headers = {'User-Agent': 'Mozilla/5.0'}

for kitab in KITAB_LIST:
    perawi = kitab['id']
    total = kitab['total']

    print(f'\nFetching existing nomor for {perawi}...', flush=True)
    existing = get_existing_nomor(perawi)
    remaining = [n for n in range(1, total + 1) if n not in existing]

    if not remaining:
        print(f'{perawi}: sudah lengkap ({len(existing)}/{total})', flush=True)
        continue

    print(f'Seeding {perawi}: {len(remaining)} missing...', flush=True)
    success = 0
    fail = 0

    for i, nomor in enumerate(remaining):
        try:
            resp = requests.get(
                f'https://api.myquran.com/v2/hadits/{perawi}/{nomor}',
                headers=headers,
                timeout=10
            )
            if resp.status_code == 200:
                d = resp.json().get('data', {})
                supabase.table('hadits_master').upsert({
                    'nomor': nomor,
                    'perawi': perawi,
                    'kitab': '',
                    'bab': '',
                    'arab': d.get('arab', ''),
                    'matan': '',
                    'terjemah': d.get('id', '')
                }, on_conflict='perawi,nomor').execute()
                success += 1
            else:
                fail += 1
        except Exception as e:
            fail += 1

        if (i + 1) % 500 == 0:
            print(f'  {perawi}: {i+1}/{len(remaining)} ok={success} fail={fail}', flush=True)

        time.sleep(0.05)

    print(f'  {perawi} DONE ok={success} fail={fail}', flush=True)

print('\nSEMUA SELESAI', flush=True)
