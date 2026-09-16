/**
 * Magnetic pull.
 *
 * Cards and list rows lean toward the pointer. The displacement is small
 * (capped at 14px) and spring-eased, so it reads as the paper being attracted
 * rather than as the element jumping — and it is the only pointer response on
 * the site that is not a colour change.
 *
 * Fine pointers only. On touch there is no hover, so this would never fire;
 * on a coarse pointer it would fire on tap and leave the element displaced.
 */
import { defineEffect, TIER } from '../kernel'
import { qa } from '../guards'

const PULL = 0.26
const MAX = 14
const TARGETS = '.xcard-link, .row-link'

export default defineEffect({
  id: 'magnetic',
  minTier: TIER.DESKTOP,
  when: () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !!document.querySelector(TARGETS),
  targets: TARGETS,

  run({ gsap }) {
    const releases: Array<() => void> = []

    qa(TARGETS).forEach((el) => {
      const node = el as HTMLElement
      // quickTo, not quickSetter: the pull has to trail the pointer slightly or
      // it reads as the element being glued to the cursor.
      const toX = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3.out' })
      const toY = gsap.quickTo(node, 'y', { duration: 0.55, ease: 'power3.out' })

      const move = (e: PointerEvent) => {
        const r = node.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        toX(gsap.utils.clamp(-MAX, MAX, dx * PULL))
        toY(gsap.utils.clamp(-MAX, MAX, dy * PULL))
      }

      const enter = () => {
        node.style.willChange = 'transform'
      }

      const leave = () => {
        toX(0)
        toY(0)
        node.style.removeProperty('will-change')
      }

      node.addEventListener('pointermove', move)
      node.addEventListener('pointerenter', enter)
      node.addEventListener('pointerleave', leave)

      releases.push(() => {
        node.removeEventListener('pointermove', move)
        node.removeEventListener('pointerenter', enter)
        node.removeEventListener('pointerleave', leave)
        node.style.removeProperty('will-change')
      })
    })

    return () => releases.forEach((fn) => fn())
  },
})
