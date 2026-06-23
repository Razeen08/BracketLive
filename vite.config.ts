import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // Proxy /fd-api/* → https://api.football-data.org/* in dev
      // This avoids CORS issues when running locally
      '/fd-api': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fd-api/, ''),
      },
    },
  },
})
