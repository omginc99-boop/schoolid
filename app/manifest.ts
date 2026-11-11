import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SchoolID — The Digital Operating System for Education',
    short_name: 'SchoolID',
    description:
      'One platform. Every school. Every stage. Student records, learning, fees, verified identity, AI and communication in one app.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0b1020',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
