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
 *
 * ── Why this file tracks a generation ──────────────────────────────────────
 *
 * `swapRootAttributes` REMOVES every attribute from <html> on each navigation
 * and re-applies only what the incoming document declares. `motion-ready`
 * therefore does not survive a page change: the layer has to be rebuilt for
 * the document that replaced the old one. The rebuild used to be driven purely
 * by the `before-swap` / `page-load` event pair, and that pair is not
 * guaranteed — an aborted view transition (`InvalidStateError: Transition was
 * aborted because of invalid state`, which this site produces routinely) can
 * drop one half of it.
 *
 * When that happened the tab was left in a state it could not leave:
 * `js-motion` present, `motion-ready` gone, the kernel's "already booted"
 * flag still set so it refused to boot again, no animation running to reveal
 * anything, and — because the inline head script only ever runs on a real
 * document load — no watchdog left to release the pre-hidden state. Every
 * `.rise` on the page sat at opacity 0 until the reader reloaded.
 *
 * Three things now make that unreachable: the generation check below, a
 * watchdog armed on every swap, and a fallback arm if `page-load` never
 * arrives.
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

/** how long the pre-hidden state may stand before it is released regardless */
const BOOT_DEADLINE = 1600
/** how long to wait for `astro:page-load` before booting without it */
const ARM_FALLBACK = 900

/** documents this tab has shown. Bumped on every swap. */
let generation = 0
/** the generation that is currently booted, or -1 for none */
let bootedGeneration = -1
let running = false

let watchdog: number | undefined
let fallback: number | undefined

function arm() {
  window.clearTimeout(fallback)

  /* Decided from state, not from whether a particular event arrived.
     `running` alone is not enough: it is only cleared by `before-swap`, so a
     dropped `before-swap` leaves it set from the previous document and every
     guard downstream — including the fallback below — reads "already fine".
     The generation is what actually changed, so the generation is what this
     compares. */
  if (running && bootedGeneration === generation) return

  /* The document this layer was built for is gone. `boot()` is guarded by its
     own flag, so a stale boot has to be undone first or it refuses to run. */
  if (bootedGeneration !== generation) disarm()

  running = true
  boot()
  bootedGeneration = generation
  window.clearTimeout(watchdog)
}

function stop() {
  running = false
  window.clearTimeout(watchdog)
  window.clearTimeout(fallback)
  disarm()
}

/**
 * `swapRootAttributes` strips every attribute on <html> that does not start
 * with `data-astro-`, so `data-theme` and our own classes are wiped on each
 * view-transition navigation. Re-assert them synchronously after the swap.
 */
function reassertRootState() {
  generation++

  const root = document.documentElement

  if (!prefersReducedMotion()) {
    root.classList.add('js-motion')

    /* The safety net the inline head script installs for the first load, which
       was missing on every page after it. Armed before anything else can throw,
       because a theme read that fails should not be able to strand the page
       behind an opacity-0 rule with nothing left to lift it. */
    window.clearTimeout(watchdog)
    watchdog = window.setTimeout(() => {
      if (!root.classList.contains('motion-ready')) {
        console.warn('[motion] boot did not complete — releasing the pre-hidden state')
        root.classList.remove('js-motion')
      }
    }, BOOT_DEADLINE)
  }

  let stored: string | null = null
  try {
    stored = localStorage.getItem('theme')
  } catch {
    // storage disabled; fall through to the media query
  }
  const theme =
    stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  root.setAttribute('data-theme', theme)

  /* And if `astro:page-load` is the half that got dropped, boot anyway. `arm`
     is idempotent and decides for itself, so a normal navigation simply clears
     this before it fires. */
  window.clearTimeout(fallback)
  fallback = window.setTimeout(arm, ARM_FALLBACK)
}

// ── View-transition lifecycle ─────────────────────────────────────────────
// `astro:page-load` only fires when view transitions are enabled, so this is
// wired unconditionally but stays inert on a plain static navigation.
document.addEventListener('astro:before-swap', stop)
document.addEventListener('astro:after-swap', reassertRootState)
document.addEventListener('astro:page-load', arm)

// ── Plain-navigation path ─────────────────────────────────────────────────
// A deferred module always executes before DOMContentLoaded, so one of these
// two branches always applies. `arm` is idempotent.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arm, { once: true })
} else {
  arm()
}
