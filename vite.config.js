// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: "La Chasse aux Renards",
        short_name: "Renards",
        description: "Une application ludique pour suivre les récompenses des enfants.",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFCFA",
        theme_color: "#df5f00",
      },
      pwaAssets: {
        image: 'public/renard-icon.svg',
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    {
      name: 'post-build-maskable-overwrite',
      closeBundle: {
        sequential: true,
        order: 'post',
        async handler() {
          const { overwriteMaskable } = await import('./scripts/overwrite-maskable.js');
          await overwriteMaskable();
        }
      }
    }
  ]
});
