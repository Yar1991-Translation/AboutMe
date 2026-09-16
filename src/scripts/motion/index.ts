/**
 * Motion entry point.
 *
 * IMPORTANT: this module is a hoisted, bundled `<script type="module">`.
 * Astro runs it ONCE per document — on a view-transition navigation the
 * browser skips it because a script with that `src` already executed (see
 * `deselectScripts` in astro/dist/transitions/swap-functions.js). So
 * everything after the first load must be driven by listeners, never by
 * re-executing this file.
 *
 * Registration order matters for one thing only: `intro` must register before
 * `reveal`, because reveal waits on the intro handshake.
 */
import { boot, disarm } from './kernel'
import { prefersReducedMotion } from './guards'

// ── Effect registration (order-sensitive: intro before reveal) ────────────
import './effects/intro'
import './effects/reveal'
import './effects/velocity'
import './effects/parallax'
import './effects/ambient'
import './effects/ghosts'
import './effects/grid'
import './effects/hud'
import './effects/progress'
import './effects/cursor'
import './effects/interactions'
import './effects/navline'
import './effects/marquee'
import './effects/scramble'
import './effects/draw'
import './effects/countup'
import './effects/magnetic'
import './effects/filtergrid'

let running = false

function arm() {
  if (running) return
  running = true
  boot()
}

function stop() {
  running = false
  disarm()
}

/**
 * `swapRootAttributes` strips every attribute on <html> that does not start
 * with `data-astro-`, so `data-theme` and our own classes are wiped on each
 * view-transition navigation. Re-assert them synchronously after the swap.
 */
function reassertRootState() {
  const root = document.documentElement
  if (!prefersReducedMotion()) root.classList.add('js-motion')

  const stored = localStorage.getItem('theme')
  const theme = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  root.setAttribute('data-theme', theme)
}

// ── View-transition lifecycle ─────────────────────────────────────────────
// `astro:page-load` only fires when view transitions are enabled, so this is
// wired unconditionally but stays inert on a plain static navigation.
document.addEventListener('astro:before-swap', stop)
document.addEventListener('astro:after-swap', reassertRootState)
document.addEventListener('astro:page-load', arm)

// ── Plain-navigation path ─────────────────────────────────────────────────
// A deferred module always executes before DOMContentLoaded, so one of these
// two branches always applies. `running` makes the double-fire a no-op.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arm, { once: true })
} else {
  arm()
}
