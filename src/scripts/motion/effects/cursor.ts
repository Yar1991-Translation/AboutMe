/**
 * Cursor reticle.
 *
 * A crosshair that follows the pointer exactly, plus a bracket ring that lags
 * behind it. The lag is the point: the ring and the cross disagree about where
 * the pointer is, which is the same misregistration the rest of the page runs
 * on. Over an interactive target the ring rotates and closes onto it.
 *
 * Fine pointers only — never on touch, never under reduced motion, and the
 * native cursor is restored over text fields where a crosshair would make
 * typing miserable.
 */
import { defineEffect, TIER } from '../kernel'
import { qa } from '../guards'

const INTERACTIVE = 'a, button, [data-glitch], input[type="submit"]'

export default defineEffect({
  id: 'cursor',
  minTier: TIER.DESKTOP,
  when: () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,

  run({ gsap, root }) {
    const reticle = document.createElement('div')
    reticle.className = 'reticle'
    reticle.setAttribute('aria-hidden', 'true')
    reticle.innerHTML = `
      <div class="reticle-ring"></div>
      <div class="reticle-cross">
        <span class="reticle-axis reticle-axis--x"></span>
        <span class="reticle-axis reticle-axis--y"></span>
      </div>
      <div class="reticle-label"></div>
    `
    document.body.appendChild(reticle)

    const ring = reticle.querySelector('.reticle-ring') as HTMLElement
    const label = reticle.querySelector('.reticle-label') as HTMLElement

    root.classList.add('has-reticle')

    // Exact follower — no smoothing, or the cross feels broken.
    const setCross = gsap.quickSetter(reticle.querySelector('.reticle-cross'), 'x', 'px')
    const setCrossY = gsap.quickSetter(reticle.querySelector('.reticle-cross'), 'y', 'px')
    // Lagging ring.
    const toRingX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' })
    const toRingY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' })

    let visible = false

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true
        reticle.classList.add('is-visible')
        gsap.set([ring, reticle.querySelector('.reticle-cross')], { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 })
      }
      setCross(e.clientX)
      setCrossY(e.clientY)
      toRingX(e.clientX)
      toRingY(e.clientY)

      const target = (e.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null
      if (target) {
        reticle.classList.add('is-locked')
        const text = (target.getAttribute('aria-label') ?? target.textContent ?? '').trim().slice(0, 22)
        if (label.textContent !== text) label.textContent = text
      } else {
        reticle.classList.remove('is-locked')
      }
    }

    const onLeave = () => {
      visible = false
      reticle.classList.remove('is-visible', 'is-locked')
    }

    const onDown = () => reticle.classList.add('is-down')
    const onUp = () => reticle.classList.remove('is-down')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      root.classList.remove('has-reticle')
      reticle.remove()
    }
  },
})
