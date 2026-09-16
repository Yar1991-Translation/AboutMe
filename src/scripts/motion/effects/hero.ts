/**
 * Hero exit — the counterweight to the entrance.
 *
 * The hero is the only place on the site with a set-piece entrance, so it gets
 * the matching exit: instead of scrolling away as one block, the heading comes
 * apart. Each character drifts to its own depth, and the three planes around
 * it (kicker, side note, meta) spread at different rates, so by the time the
 * section is gone the page has already lost its register.
 *
 * PROPERTY OWNERSHIP — this is the whole reason the tween looks the way it
 * does. `reveal` already animates `y`, `z`, `rotationX`, `rotationZ` and
 * `autoAlpha` on these same characters. A scrubbed `to` tween sharing any of
 * those would record its start value at first render and quietly undo the
 * entrance. Everything below therefore writes only `yPercent` / `xPercent` /
 * `scale` — aliases `reveal` never touches, which the CSS plugin composes into
 * the same matrix on top of what is already there.
 */
import { defineEffect, TIER } from '../kernel'
import { intro } from '../state'
import { qa } from '../guards'

/** how far each character falls, cycled by index so no two neighbours match */
const DEPTHS = [46, 104, 162]

export default defineEffect({
  id: 'hero',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('[data-hero]'),
  targets: '.hero-title .char, .hero-kicker, .hero-side, .hero-meta, .hero-scroll-fill',

  run({ gsap, S, tier }) {
    const hero = document.querySelector('[data-hero]')
    if (!hero) return

    // ── Scroll cue draws itself in, once the cover is out of the way ──────
    const cue = document.querySelector('.hero-scroll-fill')
    if (cue) {
      const draw = () =>
        gsap.fromTo(
          cue,
          { scaleY: 0 },
          { scaleY: 1, duration: 1.1, delay: 0.4, ease: 'power2.inOut', transformOrigin: 'top center' }
        )
      if (intro.playing) intro.done.then(draw)
      else draw()
    }

    const scrub = {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: tier === TIER.DESKTOP ? 1 : 0.5,
      invalidateOnRefresh: true,
    }

    const tweens: any[] = []

    // ── The heading scatters ──────────────────────────────────────────────
    const chars = qa('.hero-title .char')
    if (chars.length) {
      tweens.push(
        gsap.to(chars, {
          yPercent: (i: number) => DEPTHS[i % DEPTHS.length] * S.amp,
          xPercent: (i: number) => (i % 2 === 0 ? 1 : -1) * (3 + (i % 3) * 3) * S.amp,
          scale: 1 - 0.22 * S.amp,
          ease: 'none',
          scrollTrigger: scrub,
        })
      )
    }

    // ── The three planes around it spread ─────────────────────────────────
    const planes: Array<[string, number, number]> = [
      ['.hero-kicker', -34, -4],
      ['.hero-side', 26, 3],
      ['.hero-meta', 58, -2],
    ]
    planes.forEach(([sel, dy, dx]) => {
      const el = document.querySelector(sel)
      if (!el) return
      tweens.push(
        gsap.to(el, {
          yPercent: dy * S.amp,
          xPercent: dx * S.amp,
          ease: 'none',
          scrollTrigger: scrub,
        })
      )
    })

    return () => {
      tweens.forEach((t) => t.kill())
    }
  },
})
