import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/theme/tokens.css' // 设计变量优先
import '@/styles/base.css'
import '@/primitives/material' // 注册 @material/web 组件
import { ThemeProvider, initThemeBeforePaint } from '@/theme/ThemeProvider'
import App from '@/App.tsx'

// 首帧前注入主题，避免颜色闪烁
initThemeBeforePaint()

// 确保 Material Symbols 字体加载完成
const loadIconFont = async () => {
  try {
    const base = import.meta.env.BASE_URL
    const font = new FontFace(
      'Material Symbols Rounded',
      `url(${base}fonts/material-symbols-rounded.woff2)`,
      { weight: '100 700', style: 'normal' },
    )
    await font.load()
    document.fonts.add(font)
  } catch (e) {
    console.warn('Failed to load Material Symbols font:', e)
  }
}

loadIconFont().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
})
