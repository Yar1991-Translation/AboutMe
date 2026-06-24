/**
 * 按需注册 @material/web 组件（替代 mdui 的全量 `import 'mdui'`）。
 * 仅注册站点实际用到的自定义元素，减小首屏体积。
 * 在 main.tsx 顶部 `import '@/primitives/material'` 即可全局生效。
 */
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/text-button.js'
import '@material/web/button/elevated-button.js'
import '@material/web/button/filled-tonal-button.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'
import '@material/web/tabs/tabs.js'
import '@material/web/tabs/primary-tab.js'
import '@material/web/chips/chip-set.js'
import '@material/web/chips/assist-chip.js'
import '@material/web/ripple/ripple.js'
import '@material/web/divider/divider.js'
import '@material/web/progress/circular-progress.js'

// 用本地 Roboto + Material Symbols 覆盖 @material/web 默认字体角色
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js'

if (typeof document !== 'undefined' && 'adoptedStyleSheets' in document) {
  document.adoptedStyleSheets.push(typescaleStyles.styleSheet!)
}
