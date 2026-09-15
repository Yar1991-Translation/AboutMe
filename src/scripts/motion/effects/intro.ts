/**
 * Boot sequence — first visit only.
 *
 * A self-check that resolves into the page: a blueprint grid draws itself, a
 * counter runs 000 → 100, then the cover splits into bands and slides away,
 * handing off to the hero's character animation.
 *
 * Skipped on every navigation after the first (sessionStorage), under reduced
 * motion, and on any tier below desktop — on a phone it would just be a delay.
 */
import { defineEffect, TIER } from '../kernel'
import { intro } from '../state'

const KEY = 'archive:intro-played'
/** total time from cover-on to fully-open, in seconds */
const DURATION = 1.15
const BANDS = 4

export default defineEffect({
  id: 'intro',
  minTier: TIER.DESKTOP,
  when: () => {
    try {
      if (sessionStorage.getItem(KEY)) return false
      sessionStorage.setItem(KEY, '1')
    } catch {
      // private mode / storage disabled — play it, it's harmless
    }
    return true
  },

  run({ gsap }) {
    intro.playing = true
    intro.done = new Promise<void>((resolve) => {
      intro.finish = resolve
    })

    document.documentElement.classList.add('intro-playing')

    const cover = document.createElement('div')
    cover.className = 'intro'
    cover.setAttribute('aria-hidden', 'true')
    cover.innerHTML = `
      <div class="intro-bands">
        ${Array.from({ length: BANDS }, () => '<div class="intro-band"></div>').join('')}
      </div>
      <div class="intro-chrome">
        <div class="intro-grid"></div>
        <div class="intro-meta">
          <span class="intro-brand">ARCHIVE</span>
          <span class="intro-sub">PERSONAL RECORD</span>
        </div>
        <div class="intro-count">000</div>
      </div>
    `
    document.body.appendChild(cover)

    const count = cover.querySelector('.intro-count') as HTMLElement
    const bands = Array.from(cover.querySelectorAll<HTMLElement>('.intro-band'))

    const counter = { n: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('intro-playing')
        cover.remove()
        intro.playing = false
      },
    })

    tl.from('.intro-grid', { autoAlpha: 0, scale: 1.06, duration: 0.35, ease: 'power2.out' })
      .from('.intro-meta > *', { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.06 }, '-=0.2')
      .to(
        counter,
        {
          n: 100,
          duration: DURATION * 0.62,
          ease: 'power1.inOut',
          onUpdate: () => {
            const next = String(Math.round(counter.n)).padStart(3, '0')
            if (count.textContent !== next) count.textContent = next
          },
        },
        '<'
      )
      .to('.intro-chrome', { autoAlpha: 0, duration: 0.22 })
      // Hand off to the hero while the bands are still opening.
      .add(() => intro.finish())
      .to(
        bands,
        {
          yPercent: (i) => (i % 2 === 0 ? -101 : 101),
          duration: 0.62,
          ease: 'power4.inOut',
          stagger: { each: 0.04, from: 'center' },
        },
        '-=0.05'
      )

    return () => {
      tl.kill()
      cover.remove()
      document.documentElement.classList.remove('intro-playing')
      intro.playing = false
      intro.finish()
    }
  },
})
