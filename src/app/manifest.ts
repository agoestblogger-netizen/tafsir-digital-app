import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tafsir Digital - Quranic Life-Hacking',
    short_name: 'Tafsir Digital',
    description: 'Mentor saku menggabungkan Al-Qur\'an, sains, psikologi, dan pelacakan kebiasaan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf7', // bg-page-warm (a warm off-white)
    theme_color: '#0D3B2E', // primary green
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
