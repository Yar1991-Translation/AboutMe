/**
 * Filtering the bench, with Flip.
 *
 * The point is not that items hide — it is that the ones that remain MOVE, and
 * you can see where they went. Without Flip the grid would just snap to a new
 * arrangement and the reader loses the thread of what is left.
 *
 * The bar itself is hidden until `html.motion-ready` (see global.css), so a
 * bundle that fails to boot leaves every card visible and shows no control
 * that does nothing.
 */
import { defineEffect, gsap, ScrollTrigger, TIER } from '../kernel'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

export default defineEffect({
  id: 'filtergrid',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('[data-xgrid]') && !!document.querySelector('[data-filter-bar]'),

  run({ gsap }) {
    const grid = document.querySelector('[data-xgrid]')
    const bar = document.querySelector('[data-filter-bar]')
    if (!grid || !bar) return

    const cards = Array.from(grid.querySelectorAll('.xcard')) as HTMLElement[]
    if (!cards.length) return

    const statusBtns = Array.from(bar.querySelectorAll('[data-filter]')) as HTMLButtonElement[]
    const tagBtns = Array.from(bar.querySelectorAll('[data-tag]')) as HTMLButtonElement[]
    const readout = bar.querySelector('[data-filter-count]')
    const emptyNote = document.querySelector('[data-xgrid-empty]')

    let status = 'all'
    const tags = new Set<string>()

    const apply = (animate: boolean) => {
      /* Clicking two filters in quick succession used to leave cards stacked
         on top of each other: the second Flip started from the first one's
         absolute positioning, so both sets of coordinates were live at once.
         Killing the in-flight flip first makes the new state the only one. */
      if (animate) Flip.killFlipsOf(cards)

      const before = animate ? Flip.getState(cards) : null
      const visible: HTMLElement[] = []

      cards.forEach((card) => {
        const okStatus = status === 'all' || card.dataset.status === status
        const cardTags = (card.dataset.tags ?? '').split('|').filter(Boolean)
        const okTags = tags.size === 0 || cardTags.some((t) => tags.has(t))
        const show = okStatus && okTags
        card.hidden = !show
        if (show) visible.push(card)
      })

      if (readout) readout.textContent = `${visible.length} shown`
      if (emptyNote) emptyNote.hidden = visible.length !== 0

      if (before) {
        Flip.from(before, {
          duration: 0.55,
          ease: 'power2.inOut',
          absolute: true,
          stagger: 0.02,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { autoAlpha: 0, scale: 0.94 },
              { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'power2.out' }
            ),
          onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: 0.22 }),
        })
      } else {
        gsap.set(visible, { clearProps: 'opacity,visibility' })
      }

      /* A card that was hidden when the reveal pass ran never got its
         entrance and would come back at opacity 0. Only cards that are
         actually stuck are touched, so an in-flight reveal is never cut off. */
      const stuck = visible.filter((c) => Number(getComputedStyle(c).opacity) < 0.05)
      if (stuck.length) {
        gsap.killTweensOf(stuck)
        gsap.set(stuck, { clearProps: 'opacity,visibility,transform' })
      }

      ScrollTrigger.refresh()
    }

    const onStatus = (e: Event) => {
      const btn = (e.currentTarget as HTMLButtonElement).dataset.filter ?? 'all'
      if (btn === status) return
      status = btn
      statusBtns.forEach((b) => {
        const on = b.dataset.filter === status
        b.classList.toggle('is-on', on)
        b.setAttribute('aria-pressed', String(on))
      })
      apply(true)
    }

    const onTag = (e: Event) => {
      const btn = e.currentTarget as HTMLButtonElement
      const tag = btn.dataset.tag
      if (!tag) return
      const on = !tags.has(tag)
      if (on) tags.add(tag)
      else tags.delete(tag)
      btn.classList.toggle('is-on', on)
      btn.setAttribute('aria-pressed', String(on))
      apply(true)
    }

    statusBtns.forEach((b) => b.addEventListener('click', onStatus))
    tagBtns.forEach((b) => b.addEventListener('click', onTag))

    return () => {
      statusBtns.forEach((b) => b.removeEventListener('click', onStatus))
      tagBtns.forEach((b) => b.removeEventListener('click', onTag))
      cards.forEach((c) => {
        c.hidden = false
      })
    }
  },
})
