/**
 * Depth-plane parallax.
 *
 * The old implementation was `y: -ScrollTrigger.maxScroll(window) * speed * 2`
 * — a number derived from the LENGTH OF THE WHOLE DOCUMENT, evaluated once.
 * On a tall page that is hundreds of pixels of displacement for a 200px
 * heading, and it never returns to zero, so nothing sits on the grid.
 *
 * This version derives travel from how far the element actually moves through
 * the viewport, and is symmetric about the centre: when the element is centred,
 * its offset is 0. Grid alignment is preserved; only the passing motion is
 * exaggerated.
 */
import { defineEffect, TIER } from '../kernel'
import { qa } from '../guards'

export default defineEffect({
  id: 'parallax',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('[data-depth], [data-parallax]'),
  targets: '[data-depth], [data-parallax]',

  run({ gsap, tier, S }) {
    const planes = qa('[data-depth], [data-parallax]')

    planes.forEach((el) => {
      const raw = Number.parseFloat(
        (el as HTMLElement).dataset.depth ?? (el as HTMLElement).dataset.parallax ?? '1'
      )
      const depth = Math.max(-2, Math.min(2, Number.isFinite(raw) ? raw : 1)) * S.parallax

      // How far this element travels through the viewport over its pass.
      // offsetHeight is a layout read, but it only happens on refresh
      // (function-based values + invalidateOnRefresh), never per frame.
      const out = () => (window.innerHeight + (el as HTMLElement).offsetHeight) * 0.5 * Math.abs(depth)

      // Positive depth = foreground plane: leads the scroll and comes back.
      // Negative depth = background plane: lags behind it.
      const sign = depth >= 0 ? 1 : -1

      gsap.fromTo(
        el,
        { y: () => sign * out() },
        {
          y: () => -sign * out(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: tier === TIER.DESKTOP ? 0.8 : 0.4,
            invalidateOnRefresh: true,
            // Compositor promotion only while the plane is actually on screen.
            onToggle: (self) => {
              ;(el as HTMLElement).style.willChange = self.isActive ? 'transform' : 'auto'
            },
          },
        }
      )
    })

    return () => {
      planes.forEach((el) => {
        ;(el as HTMLElement).style.removeProperty('will-change')
      })
    }
  },
})
