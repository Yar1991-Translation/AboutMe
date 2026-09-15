/**
 * Reading progress + table-of-contents scroll spy.
 *
 * Post pages only. The progress value is published as `--read-progress` on
 * <html> so both the HUD rail and any page-level indicator read from one
 * source instead of each running its own scroll listener.
 */
import { defineEffect, ScrollTrigger, TIER } from '../kernel'
import { qa } from '../guards'

export default defineEffect({
  id: 'progress',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('.prose'),

  run({ root }) {
    const prose = document.querySelector('.prose')
    const header = document.querySelector('.detail-header')
    if (!prose || !header) return

    const bar = ScrollTrigger.create({
      trigger: header,
      start: 'top 20%',
      endTrigger: prose,
      end: 'bottom 60%',
      onUpdate: (self) => root.style.setProperty('--read-progress', self.progress.toFixed(4)),
      onLeave: () => root.style.setProperty('--read-progress', '1'),
      onLeaveBack: () => root.style.setProperty('--read-progress', '0'),
    })

    // ── Scroll spy ────────────────────────────────────────────────────────
    // One trigger over the whole article that re-derives the active heading,
    // rather than one trigger per heading with `onToggle`.
    //
    // The per-heading version desynced on any instant jump — clicking a TOC
    // link, or a deep link on load — because ScrollTrigger fires toggle
    // callbacks on state *changes*, and a jump that clears several headings in
    // one update can skip them, leaving the wrong link lit. Deriving the
    // answer from scratch each update cannot drift.
    const links = new Map<string, HTMLAnchorElement>()
    qa('.toc-list a').forEach((a) => {
      const id = (a as HTMLAnchorElement).getAttribute('href')?.replace('#', '')
      if (id) links.set(id, a as HTMLAnchorElement)
    })

    const headingEls = Array.from(links.keys())
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
      .sort((a, b) => a.offsetTop - b.offsetTop)

    let current: string | null = null

    const syncSpy = () => {
      // the last heading whose top has crossed 30% of the viewport
      const line = window.innerHeight * 0.3
      let next: string | null = null
      for (const el of headingEls) {
        if (el.getBoundingClientRect().top <= line) next = el.id
        else break
      }
      if (next === current) return
      if (current) links.get(current)?.classList.remove('is-current')
      current = next
      if (next) links.get(next)?.classList.add('is-current')
    }

    const spy = headingEls.length
      ? ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: syncSpy,
          onRefresh: syncSpy,
        })
      : null
    syncSpy()

    // Deep links (#heading) land under the sticky header without this.
    const onHashChange = () => {
      const id = location.hash.slice(1)
      if (!id) return
      const heading = document.getElementById(id)
      if (heading) ScrollTrigger.refresh()
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      bar.kill()
      spy?.kill()
      links.forEach((link) => link.classList.remove('is-current'))
      window.removeEventListener('hashchange', onHashChange)
      root.style.removeProperty('--read-progress')
    }
  },
})
