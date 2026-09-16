/**
 * Text decode.
 *
 * Section headings resolve out of noise when they arrive instead of simply
 * fading in — the same gesture as everything else on the site (a thing that is
 * not quite registered yet), applied to type rather than to placement.
 *
 * Opt-in only, via `[data-scramble]`. The plugin rewrites `textContent`, so
 * it destroys any child markup: the hero title is explicitly NOT scrambled
 * because by the time this runs it is a pile of `.char` spans and an
 * `.accent` element.
 */
import { defineEffect, gsap, TIER } from '../kernel'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { qa, visibleText } from '../guards'

gsap.registerPlugin(ScrambleTextPlugin)

/** glyphs the decode passes through — Latin + digits, so the shape stays fixed */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/—+*#'

export default defineEffect({
  id: 'scramble',
  minTier: TIER.MOBILE,
  when: () => !!document.querySelector('[data-scramble]'),
  targets: '[data-scramble]',

  run({ gsap, S }) {
    qa('[data-scramble]').forEach((el) => {
      // child elements would be wiped by the plugin
      if (el.children.length > 0) return

      const text = visibleText(el)
      if (!text) return

      /* The HUD reads the active section's heading off the DOM, and during the
         decode that text is noise — it would report "-K#2" as the section you
         are in. Publishing the settled string gives it something stable. */
      el.setAttribute('data-scramble-text', text)

      gsap.to(el, {
        duration: 0.85 * Math.max(0.6, S.dur),
        ease: 'none',
        scrambleText: {
          text,
          chars: CHARS,
          speed: 0.5,
          revealDelay: 0.18,
        },
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
      })
    })
  },
})
