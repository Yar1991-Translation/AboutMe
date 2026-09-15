/**
 * Pointer interactions that are too stateful for CSS: the button's lift /
 * press / judder, and the transmission pulse on click.
 *
 * The previous version was three separate problems stacked up:
 *   - `scale: 1.02` uniformly, which is a mechanical pop with no direction
 *   - `power2.in` on the way out, which is a dead stop rather than a settle
 *   - a click "glitch" whose clip-path insets removed two thirds of the
 *     element for a frame — on a ~130px button that reads as a blink, not a
 *     glitch. Clip-path is kept for large elements where it actually reads.
 *
 * `will-change` is applied on enter and released on leave rather than living
 * in the stylesheet — a permanent rule kept every button on its own
 * compositor layer for the whole session.
 */
import { defineEffect, TIER } from '../kernel'
import { qa } from '../guards'

/** how far the button rises when armed */
const LIFT = -2
const LIFT_SCALE = 1.015

export default defineEffect({
  id: 'interactions',
  minTier: TIER.MOBILE,

  run({ gsap, root }) {
    const releases: Array<() => void> = []

    qa('.btn').forEach((el) => {
      const btn = el as HTMLElement
      let idle: number | undefined

      const hold = () => {
        window.clearTimeout(idle)
        btn.style.willChange = 'transform'
      }

      const release = () => {
        idle = window.setTimeout(() => btn.style.removeProperty('will-change'), 220)
      }

      const arm = () => {
        hold()
        gsap.to(btn, {
          y: LIFT,
          scale: LIFT_SCALE,
          duration: 0.55,
          // a spring, so it arrives instead of stopping
          ease: 'elastic.out(1, 0.6)',
          overwrite: 'auto',
        })
      }

      const settle = () => {
        gsap.to(btn, {
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: release,
        })
      }

      const press = () => {
        hold()
        gsap.to(btn, {
          y: 1,
          scale: 0.98,
          duration: 0.09,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const fire = () => {
        // a ring leaves the button, like a key actually sending something
        const ring = document.createElement('span')
        ring.className = 'btn-pulse'
        ring.setAttribute('aria-hidden', 'true')
        btn.appendChild(ring)
        gsap.fromTo(
          ring,
          { scale: 1, opacity: 0.85 },
          {
            scale: 1.6,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ring.remove(),
          }
        )
        // and the whole key judders — no clip-path, so it never blinks out
        gsap.to(btn, {
          keyframes: [
            { x: -3, duration: 0.06 },
            { x: 2, duration: 0.06 },
            { x: -1, duration: 0.06 },
            { x: 0, duration: 0.1 },
          ],
          ease: 'power1.inOut',
        })
      }

      // `pointerup` returns to the armed state; if the pointer has already
      // left, the pointerleave handler takes it the rest of the way down
      const unpress = () => arm()

      btn.addEventListener('pointerenter', arm)
      btn.addEventListener('pointerleave', settle)
      btn.addEventListener('pointerdown', press)
      btn.addEventListener('pointerup', unpress)
      btn.addEventListener('click', fire)

      releases.push(() => {
        window.clearTimeout(idle)
        btn.removeEventListener('pointerenter', arm)
        btn.removeEventListener('pointerleave', settle)
        btn.removeEventListener('pointerdown', press)
        btn.removeEventListener('pointerup', unpress)
        btn.removeEventListener('click', fire)
        btn.style.removeProperty('will-change')
        btn.querySelectorAll('.btn-pulse').forEach((r) => r.remove())
      })
    })

    // ── Click glitch, for large display elements only ─────────────────────
    // Softened: the insets used to cut away up to two thirds of the element.
    // At heading size a third is plenty, and it reads as a torn signal rather
    // than as the element failing to render.
    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest?.('[data-glitch]') as HTMLElement | null
      if (!target || target.classList.contains('btn')) return

      target.style.willChange = 'transform, clip-path'
      gsap
        .timeline({ onComplete: () => target.style.removeProperty('will-change') })
        .to(target, {
          keyframes: [
            { x: -5, y: 2, clipPath: 'inset(0% 0 0% 0)', duration: 0.05 },
            { x: 4, y: -2, clipPath: 'inset(26% 0 36% 0)', duration: 0.05 },
            { x: -2, y: 1, clipPath: 'inset(0% 0 44% 0)', duration: 0.05 },
            { x: 0, y: 0, clipPath: 'inset(0% 0 0% 0)', duration: 0.09 },
          ],
          ease: 'power1.inOut',
        })
    }
    document.addEventListener('click', onClick)

    return () => {
      releases.forEach((fn) => fn())
      document.removeEventListener('click', onClick)
      root.style.removeProperty('--glitch')
    }
  },
})
