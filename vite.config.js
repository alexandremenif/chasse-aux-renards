// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "La Chasse aux Renards",
        short_name: "Renards",
        description: "Une application ludique pour suivre les récompenses des enfants.",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFBEB",
        theme_color: "#F97316",
      },
      pwaAssets: {
        image: 'public/renard-icon.svg',
      }
    })
  ]
});
