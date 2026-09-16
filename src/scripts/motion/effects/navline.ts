/**
 * Traveling nav indicator.
 *
 * The stylesheet draws a Klein Blue bar under whichever link is hovered or
 * current, which is correct but static — it appears and disappears in place.
 * This replaces it with a single line that TRAVELS between links and parks
 * under the current one, so moving across the nav reads as one object changing
 * position rather than as several objects blinking.
 *
 * The stylesheet's per-link bar is switched off in the same breath
 * (`html.motion-ready .nav-links a::after`) — two blue lines chasing each
 * other under one row looks like a bug, not like an effect.
 */
import { defineEffect, TIER } from '../kernel'

export default defineEffect({
  id: 'navline',
  minTier: TIER.DESKTOP,
  when: () => !!document.querySelector('.site-header nav .nav-links a'),

  run({ gsap }) {
    const nav = document.querySelector('.site-header nav') as HTMLElement | null
    const list = nav?.querySelector('.nav-links')
    if (!nav || !list) return

    const sentinel = document.createElement('span')
    sentinel.className = 'nav-sentinel'
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.willChange = 'transform, width'
    nav.appendChild(sentinel)

    const links = Array.from(list.querySelectorAll('a')) as HTMLElement[]
    const current = links.find((a) => a.classList.contains('active')) ?? null

    const place = (link: HTMLElement | null, animate: boolean) => {
      if (!link) return
      const navBox = nav.getBoundingClientRect()
      const box = link.getBoundingClientRect()
      const next = { x: box.left - navBox.left, width: box.width }
      if (animate) {
        gsap.to(sentinel, { ...next, duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
      } else {
        gsap.set(sentinel, next)
      }
    }

    // Park under the current link and only then fade in, so it never slides in
    // from the left edge on load.
    place(current, false)
    sentinel.classList.add('is-armed')

    const onEnter = (e: Event) => place(e.currentTarget as HTMLElement, true)
    const onLeave = () => place(current, true)
    const onResize = () => place(current, false)

    links.forEach((a) => a.addEventListener('pointerenter', onEnter))
    list.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)

    return () => {
      links.forEach((a) => a.removeEventListener('pointerenter', onEnter))
      list.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
      sentinel.remove()
    }
  },
})
