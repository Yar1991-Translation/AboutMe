/**
 * HUD — the instrument layer.
 *
 * A fixed overlay that reads the page the way a measuring device would: scroll
 * position, document progress, live velocity, viewport size, active section.
 *
 * This is what makes the viewing feel dissociative rather than merely
 * animated — you are not looking at a page, you are looking at a page through
 * an instrument, and the instrument is reporting on it continuously.
 *
 * Desktop only (tier 2). Below that it would eat too much of a small viewport
 * for what it adds.
 */
import { defineEffect, ScrollTrigger, TIER } from '../kernel'
import { state, onFrame } from '../state'
import { visibleText } from '../guards'

interface HudParts {
  scroll: HTMLElement | null
  progress: HTMLElement | null
  velocity: HTMLElement | null
  section: HTMLElement | null
  size: HTMLElement | null
}

export default defineEffect({
  id: 'hud',
  minTier: TIER.DESKTOP,

  run({ root }) {
    const hud = document.createElement('div')
    hud.className = 'hud'
    hud.setAttribute('aria-hidden', 'true')
    hud.innerHTML = `
      <div class="hud-corner hud-corner--tl"></div>
      <div class="hud-corner hud-corner--tr"></div>
      <div class="hud-corner hud-corner--bl"></div>
      <div class="hud-corner hud-corner--br"></div>
      <div class="hud-line hud-line--t"><span class="hud-brand">ARCHIVE / YATMT</span></div>
      <div class="hud-line hud-line--b">
        <span class="hud-scroll">SCROLL 0000 / 0000</span>
        <span class="hud-sep">—</span>
        <span class="hud-progress">0.0%</span>
      </div>
      <div class="hud-line hud-line--r">
        <span class="hud-section">INDEX</span>
        <span class="hud-size">0000 × 0000</span>
      </div>
      <div class="hud-rail"><div class="hud-rail-fill"></div></div>
      <div class="hud-velo"><div class="hud-velo-bar"></div></div>
    `
    document.body.appendChild(hud)

    const parts: HudParts = {
      scroll: hud.querySelector('.hud-scroll'),
      progress: hud.querySelector('.hud-progress'),
      velocity: hud.querySelector('.hud-velo-bar'),
      section: hud.querySelector('.hud-section'),
      size: hud.querySelector('.hud-size'),
    }

    const set = (el: HTMLElement | null, next: string) => {
      if (el && el.textContent !== next) el.textContent = next
    }

    let maxScroll = ScrollTrigger.maxScroll(window)
    let lastScroll = -1
    let lastPct = -1

    // ── Scroll position + document progress ───────────────────────────────
    const pageTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        state.progress = self.progress
        root.style.setProperty('--page-progress', self.progress.toFixed(4))
      },
      onRefresh: (self) => {
        maxScroll = self.end
      },
    })

    // ── Active section ────────────────────────────────────────────────────
    // Read from `.sec-head h2` where present, else from a page-level label.
    const sections = Array.from(document.querySelectorAll('main section'))
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const heading = el.querySelector('.sec-head h2, h1')
          const label = heading ? visibleText(heading) : ''
          state.section = (label || 'INDEX').toUpperCase().slice(0, 18)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    sections.forEach((s) => sectionObserver.observe(s))

    // ── Per-frame readouts ────────────────────────────────────────────────
    const off = onFrame(() => {
      if (document.hidden) return

      const y = Math.round(window.scrollY)
      if (y !== lastScroll) {
        lastScroll = y
        set(parts.scroll, `SCROLL ${String(y).padStart(4, '0')} / ${String(Math.round(maxScroll)).padStart(4, '0')}`)
      }

      const pct = Math.round(state.progress * 1000) / 10
      if (pct !== lastPct) {
        lastPct = pct
        set(parts.progress, `${pct.toFixed(1)}%`)
      }

      set(parts.section, state.section || 'INDEX')
      set(parts.size, `${window.innerWidth} × ${window.innerHeight}`)

      // The bar is driven by the same velocity field as everything else, so
      // it reads as part of the instrument rather than a separate widget.
      if (parts.velocity) {
        parts.velocity.style.transform = `scaleX(${Math.min(1, state.mag).toFixed(3)})`
        parts.velocity.style.transformOrigin = state.dir >= 0 ? 'left center' : 'right center'
      }
    })

    return () => {
      off()
      pageTrigger.kill()
      sectionObserver.disconnect()
      hud.remove()
      root.style.removeProperty('--page-progress')
    }
  },
})
