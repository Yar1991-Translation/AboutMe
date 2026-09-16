/**
 * Ticker band — the one piece of motion on the site that is not a reaction.
 *
 * It runs on its own, and the scroll velocity field is mixed into its
 * `timeScale`: scrolling down winds it forward, scrolling up runs it
 * backwards, and at rest it settles to its base speed. Nothing else on the
 * page reverses direction like this, which is exactly why it works — the page
 * reads as being pulled through a machine rather than as a document.
 *
 * The loop is seamless by construction: sets are cloned until half the track
 * covers the viewport, then the track is translated by exactly -50%, at which
 * point the second half is sitting where the first half started.
 */
import { defineEffect, TIER } from '../kernel'
import { state, onFrame } from '../state'
import { qa } from '../guards'

/** how much of the scroll velocity reaches the belt, at full tier */
const DRIVE = 3
const LIMIT = 4

export default defineEffect({
  id: 'marquee',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('[data-ticker]'),
  targets: '.ticker-track',

  run({ gsap, S }) {
    const tracks: any[] = []
    const clones: Element[] = []

    qa('[data-ticker]').forEach((bar) => {
      const track = bar.querySelector('[data-ticker-track]')
      if (!track) return

      const sets = Array.from(track.querySelectorAll('.ticker-set'))
      if (!sets.length) return

      const width = () => (sets[0] as HTMLElement).getBoundingClientRect().width
      const barWidth = (bar as HTMLElement).getBoundingClientRect().width
      let w = width()
      if (!(w > 0)) return

      // Grow in pairs so the -50% wrap always lands on an identical set, and
      // keep going until one half of the track covers the whole band.
      let count = sets.length
      const host = sets[0].parentElement!
      while ((count / 2) * w < barWidth && count < 24) {
        for (let i = 0; i < 2; i++) {
          const clone = sets[0].cloneNode(true) as Element
          host.appendChild(clone)
          clones.push(clone)
        }
        count += 2
        w = width()
      }

      const reverse = bar.hasAttribute('data-ticker-reverse')
      const speed = Number.parseFloat(bar.getAttribute('data-ticker-speed') ?? '26') || 26

      if (reverse) gsap.set(track, { xPercent: -50 })

      tracks.push(
        gsap.to(track, {
          xPercent: reverse ? 0 : -50,
          duration: speed,
          ease: 'none',
          repeat: -1,
          scrollTrigger: {
            trigger: bar,
            start: 'top bottom',
            end: 'bottom top',
            toggleActions: 'play pause resume pause',
          },
        })
      )
    })

    if (!tracks.length) return

    const off = onFrame(() => {
      if (document.hidden) return
      const scale = gsap.utils.clamp(-LIMIT, LIMIT, 1 + state.v * DRIVE * S.velocity)
      for (const t of tracks) t.timeScale(scale)
    })

    return () => {
      off()
      tracks.forEach((t) => t.kill())
      clones.forEach((c) => c.remove())
    }
  },
})
