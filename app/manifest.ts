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
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
