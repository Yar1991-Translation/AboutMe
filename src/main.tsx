import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // 本地样式优先加载
import 'mdui/mdui.css'
import 'mdui'
import App from './App.tsx'

// 确保 Material Symbols 字体加载完成
const loadIconFont = async () => {
  try {
    const base = import.meta.env.BASE_URL
    // 使用 FontFace API 显式加载字体
    const font = new FontFace(
      'Material Symbols Rounded',
      `url(${base}fonts/material-symbols-rounded.woff2)`,
      { weight: '100 700', style: 'normal' }
    )
    await font.load()
    document.fonts.add(font)
  } catch (e) {
    console.warn('Failed to load Material Symbols font:', e)
  }
}

// 等待字体加载后再渲染
loadIconFont().then(() => {
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
})
