import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['pwa-source.svg'],
      manifest: {
        id: '/',
        name: 'After the Bell',
        short_name: 'After the Bell',
        description: 'Uma escola à noite. O relógio parado em 03:17.',
        lang: 'pt-BR',
        theme_color: '#12151c',
        background_color: '#12151c',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,glb,vrm,webmanifest}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/sw\.js$/, /^\/workbox-/],
      },
    }),
  ],
  assetsInclude: ['**/*.vrm'],
})
