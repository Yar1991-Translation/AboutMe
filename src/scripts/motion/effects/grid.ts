/**
 * Broken grid + misregistration.
 *
 * A fixed print layer of 12 column rules sits behind the content. Each rule
 * drifts at its own rate as the page scrolls and the whole group lags the
 * scroll slightly, so the "paper" is always a fraction of a second behind the
 * content printed on it. One rule is Klein Blue; one is offset a few pixels
 * off its column; one stops short. The grid is legible but never trustworthy.
 *
 * Built at runtime so it exists once, not in every page's markup, and so it
 * can be torn down and rebuilt cleanly on navigation.
 */
import { defineEffect, ScrollTrigger, TIER } from '../kernel'
import { q1 } from '../guards'

const COLUMNS = 12

export default defineEffect({
  id: 'grid',
  minTier: TIER.DESKTOP,

  run({ gsap, S, root }) {
    const layer = document.createElement('div')
    layer.className = 'grid-layer'
    layer.setAttribute('aria-hidden', 'true')

    // One Klein Blue rule, one that stops short, one nudged off its column.
    const ACCENT = 4
    const SHORT = 9
    const OFFSET = 7

    for (let i = 0; i < COLUMNS; i++) {
      const rule = document.createElement('div')
      rule.className = 'grid-rule'
      if (i === ACCENT) rule.classList.add('grid-rule--accent')
      if (i === SHORT) rule.classList.add('grid-rule--short')
      if (i === OFFSET) rule.classList.add('grid-rule--offset')
      layer.appendChild(rule)
    }

    document.body.appendChild(layer)

    const rules = Array.from(layer.children) as HTMLElement[]

    /**
     * Snap the rules to the REAL content grid.
     *
     * These were originally placed at viewport fractions (`(i + 0.5) / 12`),
     * which meant the overlay grid did not line up with the 12 columns the
     * content actually sits on — so every section looked slightly misplaced,
     * and the deliberate misregistration read as sloppiness rather than as
     * intent. A misprint only reads as a misprint when the base register is
     * correct.
     *
     * `.wrap` sets `padding: 0 var(--gutter)`, and `.grid-12` sets its own
     * `column-gap`, so both are read back rather than assumed.
     */
    const align = () => {
      const wrap = q1<HTMLElement>('.wrap')
      const grid = q1<HTMLElement>('.grid-12')
      if (!wrap) return
      const wr = wrap.getBoundingClientRect()
      const pad = Number.parseFloat(getComputedStyle(wrap).paddingLeft) || 0
      const gap = Number.parseFloat(getComputedStyle(grid ?? wrap).columnGap) || pad || 24
      const inner = wr.width - pad * 2
      const colW = (inner - gap * (COLUMNS - 1)) / COLUMNS
      if (!(colW > 0)) return

      rules.forEach((rule, i) => {
        rule.style.left = `${Math.round(wr.left + pad + i * (colW + gap))}px`
      })
    }

    align()
    ScrollTrigger.addEventListener('refresh', align)

    // Whole plate lags the scroll — reads as a printing error, not as motion.
    const plate = gsap.fromTo(
      layer,
      { y: -14 * S.drift },
      {
        y: 14 * S.drift,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 1.2, invalidateOnRefresh: true },
      }
    )

    // Individual rules wander independently.
    const drifts = rules.map((rule, i) =>
      gsap.fromTo(
        rule,
        { yPercent: -((i % 5) + 1) * 1.6 * S.drift, x: 0 },
        {
          yPercent: ((i % 4) + 1) * 1.6 * S.drift,
          x: (i % 2 === 0 ? 1 : -1) * (2 + (i % 3)) * S.drift,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 2 + (i % 4) * 0.4, invalidateOnRefresh: true },
        }
      )
    )

    // Elements that are permanently off-register. The offset itself is CSS
    // (relative + top/left); this only adds a slow wander so they never
    // settle into a single stable position.
    const loose = root.querySelectorAll('.offset-1, .offset-2, .offset-3, .offset-4')
    loose.forEach((el, i) => {
      gsap.to(el, {
        x: (i % 2 === 0 ? 1 : -1) * 5 * S.drift,
        duration: 7 + i,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    })

    return () => {
      ScrollTrigger.removeEventListener('refresh', align)
      plate.kill()
      drifts.forEach((t) => t.kill())
      layer.remove()
    }
  },
})
