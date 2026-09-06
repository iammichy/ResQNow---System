import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        resident: resolve(import.meta.dirname, 'index.html'),
        responders: resolve(import.meta.dirname, 'responders/index.html'),
      },
    },
  },
})
