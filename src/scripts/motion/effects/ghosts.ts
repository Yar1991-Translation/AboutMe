/**
 * Ghost / echo typography — the core dissociative gesture.
 *
 * Each heading gets one or two Klein Blue duplicates behind it. Their offset
 * and opacity are driven entirely by the velocity custom properties, so the
 * echo detaches while you are scrolling, separates further the faster you go,
 * and re-registers the instant you stop. The page never just sits there.
 *
 * The layers are `aria-hidden` and created at runtime, so there is no markup
 * duplication and nothing for a screen reader to read twice.
 */
import { defineEffect, TIER } from '../kernel'
import { qa, visibleText } from '../guards'

// `.hero-title` is deliberately absent: the hero uses the stronger dissect
// treatment (see reveal.ts). Stacking whole-text echoes on top of band-sliced
// strips would just be noise.
const HOSTS = '.archive-title, [data-ghost]'

export default defineEffect({
  id: 'ghosts',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector(HOSTS),

  run({ S }) {
    if (S.ghosts < 1) return

    const hosts = qa(HOSTS)

    hosts.forEach((host) => {
      if (host.hasAttribute('data-ghosted')) return
      host.setAttribute('data-ghosted', '')
      host.classList.add('ghost-host')

      const text = visibleText(host)
      if (!text) return

      for (let i = 0; i < S.ghosts; i++) {
        const layer = document.createElement('span')
        layer.className = `ghost-layer ghost-layer--${i + 1}`
        layer.setAttribute('aria-hidden', 'true')
        layer.textContent = text
        host.appendChild(layer)
      }
    })

    return () => {
      qa('.ghost-layer').forEach((l) => l.remove())
      qa('.ghost-host').forEach((h) => {
        h.classList.remove('ghost-host')
        h.removeAttribute('data-ghosted')
      })
    }
  },
})
