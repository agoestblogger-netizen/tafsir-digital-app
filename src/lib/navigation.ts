// Standar URL back navigation per halaman
export const BACK_NAVIGATION: Record<string, string> = {
  // Hadits
  '/hadits/topik/[id]':       '/hadits?tab=topik',
  '/hadits/[perawi]':         '/hadits?tab=perawi',
  '/hadits/[perawi]/[nomor]': '/hadits/[perawi]',
  '/hadits/cari':             '/hadits',

  // Tafsir Sains
  '/tafsir-sains/tokoh/[id]':  '/tafsir-sains?tab=tokoh',
  '/tafsir-sains/ayat/[id]':   '/tafsir-sains?tab=ayat',
  '/tafsir-sains/kisah/[slug]': '/tafsir-sains?tab=kisah',

  // Kultum
  '/kultum/hasil/[id]':   '/kultum/history',
  '/kultum/history':      '/kultum',

  // Doa
  '/doa/[id]':            '/doa',
  '/doa/kategori/[slug]': '/doa',
  '/doa/hajat':           '/doa',
  '/doa/hajat/[tema]':    '/doa/hajat',

  // Hijrah
  '/hijrah':              '/',

  // Komunitas
  '/komunitas/[id]':      '/komunitas',
}

export function getBackUrl(pathname: string): string {
  // Coba exact match dulu
  if (BACK_NAVIGATION[pathname]) return BACK_NAVIGATION[pathname]

  // Coba pattern match dengan dynamic segments
  for (const [pattern, backUrl] of Object.entries(BACK_NAVIGATION)) {
    const regex = new RegExp(
      '^' + pattern.replace(/\[[\w]+\]/g, '[^/]+') + '$'
    )
    if (regex.test(pathname)) {
      // Replace dynamic segments di backUrl dengan nilai aktual
      const patternParts = pattern.split('/')
      const pathParts = pathname.split('/')
      let resolvedUrl = backUrl
      patternParts.forEach((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          resolvedUrl = resolvedUrl.replace(part, pathParts[i] || '')
        }
      })
      return resolvedUrl
    }
  }

  // Fallback: naik satu level
  const parts = pathname.split('/').filter(Boolean)
  parts.pop()
  return parts.length > 0 ? '/' + parts.join('/') : '/'
}
