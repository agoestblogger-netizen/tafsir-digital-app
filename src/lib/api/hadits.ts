// ─── Hadits API — api.myquran.com/v2/hadits ──────────────────────────────────
// Endpoint: GET /v2/hadits/{perawi}/{nomor} → single hadits
// NOTE: API ini tidak mendukung list/pagination. List dibangun dengan fetch paralel.

const BASE_URL = 'https://api.myquran.com/v2/hadits';

export interface Hadits {
  number: number;
  arab: string;
  id: string;     // terjemahan Indonesia
  grade?: string; // derajat hadits
}

export interface HaditsSingleResponse {
  status: boolean;
  data: Hadits;
  info?: {
    perawi: { name: string; slug: string; total: number };
  };
}

// ─── Perawi config ─────────────────────────────────────────────────────────
export const PERAWI_LIST = [
  { id: 'bukhari',    name: 'Shahih Bukhari',   arabName: 'صَحِيحُ الْبُخَارِي',  available: 6638,  level: 'Paling Shahih' },
  { id: 'muslim',     name: 'Shahih Muslim',    arabName: 'صَحِيحُ مُسْلِم',       available: 4930,  level: 'Paling Shahih' },
  { id: 'abu-dawud',  name: 'Sunan Abu Dawud',  arabName: 'سُنَنُ أَبِي دَاوُد',   available: 4419,  level: 'Hasan Shahih'  },
  { id: 'tirmidzi',   name: 'Sunan Tirmidzi',   arabName: 'سُنَنُ التِّرْمِذِي',   available: 3625,  level: 'Hasan Shahih'  },
  { id: 'nasai',      name: "Sunan Nasa'i",     arabName: 'سُنَنُ النَّسَائِي',    available: 5761,  level: 'Shahih'        },
  { id: 'ibnu-majah', name: 'Sunan Ibnu Majah', arabName: 'سُنَنُ ابْنِ مَاجَه',  available: 4285,  level: 'Hasan'         },
  { id: 'ahmad',      name: 'Musnad Ahmad',     arabName: 'مُسْنَدُ أَحْمَد',     available: 4305,  level: 'Hasan Shahih'  },
  { id: 'malik',      name: "Muwatha' Malik",   arabName: 'مُوَطَّأُ مَالِك',     available: 1587,  level: 'Shahih'        },
  { id: 'darimi',     name: 'Sunan Darimi',     arabName: 'سُنَنُ الدَّارِمِي',   available: 2949,  level: 'Hasan Shahih'  },
];

// ─── Pagination helper ──────────────────────────────────────────────────────
const LIMIT = 20;

export function totalPages(available: number, limit = LIMIT): number {
  return Math.ceil(available / limit);
}

// ─── API calls ─────────────────────────────────────────────────────────────

/**
 * Fetch a single hadith by number.
 * Returns the Hadits object or null on failure.
 */
export async function getHaditsDetail(
  perawi: string,
  nomor: number
): Promise<Hadits | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/${perawi}/${nomor}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const json: HaditsSingleResponse = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

/**
 * Fetch a page of hadiths for a given perawi (parallel fetching by nomor range).
 * Returns { data: Hadits[], total, total_pages, current_page }.
 */
export async function getHaditsList(
  perawi: string,
  page: number = 1,
  limit: number = LIMIT
): Promise<{
  data: Hadits[];
  total: number;
  total_pages: number;
  current_page: number;
}> {
  const perawiInfo = PERAWI_LIST.find(p => p.id === perawi);
  const total = perawiInfo?.available ?? 0;
  const total_pages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Fetch semua hadits di halaman ini secara paralel
  const promises = [];
  for (let n = start; n <= end; n++) {
    promises.push(getHaditsDetail(perawi, n));
  }

  const results = await Promise.all(promises);
  const data = results.filter((h): h is Hadits => h !== null);

  return { data, total, total_pages, current_page: page };
}

/**
 * Fetch hadits hari ini (Bukhari, nomor berdasarkan hari dalam tahun mod 100).
 */
export async function getHaditsHariIni(): Promise<Hadits | null> {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const nomor = (dayOfYear % 100) + 1;
  return getHaditsDetail('bukhari', nomor);
}

// ─── Utility: extract single perawi from hadith citation text ───────────────
export function extractPerawi(text: string): { slug: string; name: string } | null {
  const map: Record<string, string> = {
    'bukhari':    'bukhari',    'muslim':     'muslim',
    'abu dawud':  'abu-dawud', 'abu daud':   'abu-dawud',
    'tirmidzi':   'tirmidzi',  "nasa'i":     'nasai',
    'nasai':      'nasai',     'ibnu majah': 'ibnu-majah',
    'ahmad':      'ahmad',     'malik':      'malik',
    'darimi':     'darimi',
  };
  const lower = text.toLowerCase();
  for (const [key, slug] of Object.entries(map)) {
    if (lower.includes(key)) return { slug, name: key };
  }
  return null;
}

// ─── Utility: parse ALL perawi + optional nomor from hadith citation text ────
export interface ParsedHaditsRef {
  perawi: string;      // slug (e.g. 'abu-dawud')
  perawiName: string;  // display name
  nomor?: number;      // hadits number if found
  href: string;        // final URL
}

const PERAWI_PARSE_MAP: Record<string, { slug: string; name: string }> = {
  'bukhari':     { slug: 'bukhari',    name: 'Shahih Bukhari'   },
  'bukhori':     { slug: 'bukhari',    name: 'Shahih Bukhari'   },
  'al-bukhari':  { slug: 'bukhari',    name: 'Shahih Bukhari'   },
  'muslim':      { slug: 'muslim',     name: 'Shahih Muslim'    },
  'abu dawud':   { slug: 'abu-dawud',  name: 'Sunan Abu Dawud'  },
  'abu daud':    { slug: 'abu-dawud',  name: 'Sunan Abu Dawud'  },
  'tirmidzi':    { slug: 'tirmidzi',   name: 'Sunan Tirmidzi'   },
  'tirmizi':     { slug: 'tirmidzi',   name: 'Sunan Tirmidzi'   },
  "nasa'i":      { slug: 'nasai',      name: "Sunan Nasa'i"     },
  'nasai':       { slug: 'nasai',      name: "Sunan Nasa'i"     },
  'an-nasai':    { slug: 'nasai',      name: "Sunan Nasa'i"     },
  'ibnu majah':  { slug: 'ibnu-majah', name: 'Sunan Ibnu Majah' },
  'ibnu madjah': { slug: 'ibnu-majah', name: 'Sunan Ibnu Majah' },
  'ahmad':       { slug: 'ahmad',      name: 'Musnad Ahmad'     },
  'malik':       { slug: 'malik',      name: "Muwatha' Malik"   },
  'darimi':      { slug: 'darimi',     name: 'Sunan Darimi'     },
  'ad-darimi':   { slug: 'darimi',     name: 'Sunan Darimi'     },
};

const NOMOR_PATTERNS = [
  /[Nn]o\.\s*(\d+)/,     // "No. 6018"  or "no. 6018" — highest priority
  /[Nn]omor\s+(\d+)/,   // "Nomor 6018"
  /[Nn]o\s+(\d+)/,      // "No 6018" (no dot)
  /#\s*(\d+)/,           // "#6018"
];

export function parseHaditsRef(text: string): ParsedHaditsRef[] {
  const lower = text.toLowerCase();
  const results: ParsedHaditsRef[] = [];

  for (const [keyword, info] of Object.entries(PERAWI_PARSE_MAP)) {
    if (!lower.includes(keyword)) continue;
    if (results.some(r => r.perawi === info.slug)) continue; // no duplicates

    const pos = lower.indexOf(keyword);
    const windowOriginal = text.substring(pos, pos + 80);
    let nomor: number | undefined;

    for (const pattern of NOMOR_PATTERNS) {
      const m = windowOriginal.match(pattern);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > 0 && n <= 30000) { nomor = n; break; }
      }
    }

    const href = nomor ? `/hadits/${info.slug}/${nomor}` : `/hadits/${info.slug}`;
    results.push({ perawi: info.slug, perawiName: info.name, nomor, href });
  }

  return results;
}
