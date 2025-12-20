import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Vercel 默认根路径部署：/
  // 如需继续兼容 GitHub Pages 子路径，可在 CI/平台设置 VITE_BASE=/AboutMe/
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
