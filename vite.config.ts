import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/dokumente/',
  plugins: [react(), tailwindcss()],
  // react-pdf bringt seinen kompletten Layout-/Font-Stack in einem Chunk mit; das ist gewollt (keine
  // sinnvolle weitere Aufteilung) und soll nicht bei jedem Build als Warnung auftauchen.
  build: { chunkSizeWarningLimit: 1600 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
