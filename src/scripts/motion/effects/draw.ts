/**
 * Blueprint linework draws itself.
 *
 * Every figure plate and geometric frame on the site is a technical drawing of
 * something, so it is plotted rather than faded in: the strokes run on with a
 * stagger, shortest first, the way a pen would actually lay them down.
 *
 * Only stroked geometry is targeted. Filled shapes (the Klein Blue triangle,
 * the corner brackets) have no stroke for DrawSVG to run along and would be a
 * silent no-op, so they stay with the reveal pass.
 */
import { defineEffect, gsap, TIER } from '../kernel'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { qa } from '../guards'

gsap.registerPlugin(DrawSVGPlugin)

const PARTS = '.plate-line, .plate-line-soft, .plate-node, .plate-diagonal, .geo-svg line'

export default defineEffect({
  id: 'draw',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('.plate, .geo-frame'),
  targets: PARTS,

  run({ gsap, S }) {
    qa('.plate, .geo-frame').forEach((host) => {
      // Scoped to the host: a document-wide query per host would be O(n²) and
      // would draw every plate's lines on the first plate's trigger.
      const parts = Array.from(host.querySelectorAll(PARTS))
      if (!parts.length) return

      // Short strokes first — the plate builds up from its details outward.
      parts.sort((a, b) => {
        const len = (el: Element) => {
          const r = (el as SVGGraphicsElement).getBBox?.()
          return r ? r.width + r.height : 0
        }
        return len(a) - len(b)
      })

      const total = 1.1 * S.dur

      gsap.fromTo(
        parts,
        { drawSVG: '0%' },
        {
          drawSVG: '100%',
          duration: 0.5,
          ease: 'power1.inOut',
          stagger: total / Math.max(1, parts.length),
          scrollTrigger: { trigger: host, start: 'top 82%', toggleActions: 'play none none none' },
        }
      )
    })
  },
})
