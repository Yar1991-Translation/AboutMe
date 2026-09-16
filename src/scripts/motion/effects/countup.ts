/**
 * Numeric readouts.
 *
 * Two things that must not lie when JavaScript is not there:
 *
 *   [data-count]   — the number is ALREADY in the markup, so a failed bundle
 *                    leaves the true value on screen. The tween only replays it
 *                    from zero once the element is in view.
 *   [data-meter]   — the fill's true length lives in CSS, via `--meter`. GSAP
 *                    animates `fromTo`, never `to`: a `to` would read the
 *                    final value as its start value and animate nothing. This
 *                    is also why the CSS keeps the transform: with no JS the
 *                    meter still shows the real proportion instead of an empty
 *                    ruler.
 */
import { defineEffect, TIER } from '../kernel'
import { qa } from '../guards'

export default defineEffect({
  id: 'countup',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('[data-count], [data-meter]'),
  targets: '.meter-fill',

  run({ gsap, S }) {
    // ── Numbers ───────────────────────────────────────────────────────────
    qa('[data-count]').forEach((el) => {
      const to = Number.parseFloat(el.getAttribute('data-count') ?? '')
      if (!Number.isFinite(to)) return

      const suffix = el.getAttribute('data-count-suffix') ?? ''
      const prefix = el.getAttribute('data-count-prefix') ?? ''
      const decimals = Number.parseInt(el.getAttribute('data-count-decimals') ?? '0', 10) || 0
      const box = { n: 0 }

      gsap.to(box, {
        n: to,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          const next = prefix + box.n.toFixed(decimals) + suffix
          if (el.textContent !== next) el.textContent = next
        },
        scrollTrigger: { trigger: el, start: 'top 94%', toggleActions: 'play none none none' },
      })
    })

    // ── Meters ────────────────────────────────────────────────────────────
    qa('[data-meter]').forEach((el) => {
      const raw = Number.parseFloat(el.getAttribute('data-meter') ?? '')
      if (!Number.isFinite(raw)) return
      const fill = el.querySelector('.meter-fill')
      if (!fill) return

      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: Math.max(0, Math.min(1, raw / 100)),
          transformOrigin: 'left center',
          duration: 1.1 * Math.max(0.6, S.dur),
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 94%', toggleActions: 'play none none none' },
        }
      )
    })
  },
})
