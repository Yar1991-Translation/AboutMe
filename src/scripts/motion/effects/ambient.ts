/**
 * Ambient motion — everything that loops forever.
 *
 * All continuous animation lives in one place so the "only animate what is on
 * screen" rule is enforced in a single spot. Each infinite tween is bound to a
 * ScrollTrigger with `play pause / resume pause`, so off-screen decorations
 * stop burning compositor frames.
 *
 * This is also why `.geo-frame` no longer has a CSS keyframe: a CSS animation
 * cannot be paused, cannot compose with the scroll entrance, and — being a
 * CSS animation — silently overrode every inline transform GSAP wrote to it.
 */
import { defineEffect, TIER } from '../kernel'
import { qa } from '../guards'

const SCROLL_BOUND = {
  start: 'top bottom',
  end: 'bottom top',
  toggleActions: 'play pause resume pause',
} as const

export default defineEffect({
  id: 'ambient',
  minTier: TIER.MOBILE,
  targets:
    '.geo-frame, .plate-wave-float, .wave-deco path, .plate-node--blue, .annotation-node, .dissociate-1, .dissociate-2',

  run({ gsap, S }) {
    // ── Geometric frames drift ────────────────────────────────────────────
    qa('.geo-frame').forEach((frame, i) => {
      gsap.to(frame, {
        y: 15 * S.amp,
        x: (i % 2 === 0 ? 10 : -10) * S.amp,
        rotation: (i % 2 === 0 ? 5 : -5) * S.amp,
        duration: 4 + i,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        scrollTrigger: { trigger: frame, ...SCROLL_BOUND },
      })
    })

    // ── Klein Blue waves ──────────────────────────────────────────────────
    // The float goes on the `<g>` wrapper, not the path — the path's CSS hover
    // lift owns transform on the path itself.
    qa('.plate-wave-float, .wave-deco path').forEach((wave) => {
      gsap.to(wave, {
        y: -8,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        scrollTrigger: { trigger: wave, ...SCROLL_BOUND },
      })
    })

    // ── Klein Blue node pulse ─────────────────────────────────────────────
    // Used to be a CSS keyframe, which fought the scroll-in reveal for the
    // same `scale` property. The reveal owns `scale` on these elements; the
    // pulse runs on `opacity` instead so the two never collide.
    qa('.plate-node--blue').forEach((node, i) => {
      gsap.to(node, {
        opacity: 0.35,
        duration: 1.6,
        delay: i * 0.25,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        scrollTrigger: { trigger: node, ...SCROLL_BOUND },
      })
    })

    // ── Annotation nodes drift ────────────────────────────────────────────
    // Same wander the stylesheet used to run as an infinite keyframe. It moved
    // here because the keyframe owned `transform` outright and wiped the scale
    // the reveal pass writes to the same property.
    qa('.annotation-node').forEach((node, i) => {
      gsap.to(node, {
        y: -5,
        x: 3,
        duration: 3 + i * 0.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        scrollTrigger: { trigger: node, ...SCROLL_BOUND },
      })
    })

    // ── Permanent misregistration ─────────────────────────────────────────
    // These elements are deliberately off-grid and never snap back. The
    // offsets themselves live in CSS (`relative` + top/left, not transform),
    // so this only adds the slow sub-pixel wander on top.
    qa('.dissociate-1, .dissociate-2').forEach((el, i) => {
      gsap.to(el, {
        x: (i % 2 === 0 ? 3 : -3) * S.amp,
        y: (i % 2 === 0 ? -4 : 4) * S.amp,
        duration: 6 + i * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        scrollTrigger: { trigger: el, ...SCROLL_BOUND },
      })
    })
  },
})
