/**
 * Velocity field.
 *
 * The whole "dissociative" idea rests on one thing: the interface should react
 * to being *moved*, not sit there like a poster. So there is exactly one place
 * that measures scroll velocity, and it publishes the result as two custom
 * properties on <html>:
 *
 *   --vmag   signed, -1..1   (direction preserved)
 *   --vint   unsigned, 0..1  (magnitude — for calc() without abs())
 *
 * Everything downstream reads those from CSS, so ghost offsets, grid drift,
 * heading tracking and the HUD readout all stay in sync and none of them
 * needs its own scroll listener.
 */
import { defineEffect, quantise, TIER } from '../kernel'
import { state, onFrame } from '../state'

/** px/s that maps to full strength */
const MAX_V = 1500
/** per-frame lerp toward target */
const DECAY = 0.14
/** how fast the raw reading bleeds off after the last scroll event */
const BLEED = 0.86

export default defineEffect({
  id: 'velocity',
  minTier: TIER.MOBILE,

  run({ ScrollTrigger, root }) {
    let raw = 0
    let v = 0
    let dir = 1
    let last = Number.NaN

    // `self.getVelocity()` is the only first-class velocity source in
    // ScrollTrigger, and it is only available inside callbacks — hence a
    // page-spanning trigger whose sole job is to sample it.
    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        raw = self.getVelocity()
        dir = self.direction
      },
      onRefresh: () => {
        raw = 0
      },
    })

    const write = (q: number, mag: number) => {
      if (q === last) return
      last = q
      root.style.setProperty('--vmag', String(q))
      root.style.setProperty('--vint', String(Math.abs(mag)))
      root.classList.toggle('is-scrolling', Math.abs(mag) > 0.03)
    }

    const off = onFrame(() => {
      if (document.hidden) return

      const target = Math.max(-1, Math.min(1, raw / MAX_V))
      v += (target - v) * DECAY
      // onUpdate stops firing the moment scrolling stops, so the tail of the
      // decay is driven by bleeding `raw` down here instead.
      raw *= BLEED

      if (Math.abs(v) < 0.005) {
        if (last !== 0) {
          v = 0
          state.v = 0
          state.mag = 0
          write(0, 0)
        }
        return
      }

      state.v = v
      state.mag = Math.abs(v)
      state.dir = dir
      write(quantise(v), v)
    })

    return () => {
      off()
      trigger.kill()
      root.style.removeProperty('--vmag')
      root.style.removeProperty('--vint')
      root.classList.remove('is-scrolling')
    }
  },
})
