import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { biliApiProxy } from './vite-bili-proxy'

// https://vite.dev/config/
export default defineConfig({
  // Vercel 默认根路径部署：/
  // 如需继续兼容 GitHub Pages 子路径，可在 CI/平台设置 VITE_BASE=/AboutMe/
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), biliApiProxy()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@material/web')) return 'material-web'
          if (id.includes('node_modules/@material/material-color-utilities')) return 'color-utils'
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion'))
            return 'motion'
          if (id.includes('node_modules/react-router')) return 'router'
        },
      },
    },
  },
})
