/**
 * Entrance choreography — everything that plays once as an element arrives.
 *
 * Replaces the single monolithic block in Animations.astro. The behaviours are
 * unchanged; what changed is that each group is independently skippable and a
 * failure in one no longer takes the rest down.
 *
 * ── Why every entrance here is a `fromTo` and not a `from` ────────────────────
 *
 * `gsap.from(x, {autoAlpha: 0})` asks GSAP to read the element's CURRENT value
 * and animate towards it. That is fine when the current value is the element's
 * real resting state, and wrong whenever it is not — and during boot it is not.
 *
 * `html.js-motion:not(.motion-ready) .rise { opacity: 0 }` is still in force
 * while this effect runs (`motion-ready` is added at the very end of boot), so
 * the computed opacity of every `.rise` at that moment is 0. A `from` tween
 * built then animates 0 -> 0 and the element never appears. For a long time a
 * stray CSS keyframe was accidentally masking this by outranking the stylesheet
 * rule and giving GSAP a non-zero number to read; removing the keyframe exposed
 * it, and in `astro dev` the keyframe was usually reading 0 itself.
 *
 * `fromTo` states both ends outright, so the tween is correct no matter what
 * the cascade happens to be showing when it is built.
 */
import { defineEffect, ScrollTrigger } from '../kernel'
import { intro } from '../state'
import { qa, visibleText } from '../guards'

const BANDS = 3

/**
 * Cuts a heading into horizontal strips, each a Klein Blue copy of the whole
 * word clipped to its own band and pushed sideways. Offsets are permanent
 * (see `.dissect-band`), so the title never fully registers.
 *
 * The strips are built with the SAME per-character inline-block structure the
 * base uses. Left as plain text they measure differently — `letter-spacing`
 * is applied around inline-blocks differently than around bare characters —
 * and the copy drifts progressively across the word. That drift reads as a
 * mistake. With matched metrics the only displacement left is the deliberate
 * one, and a misprint only reads as a misprint when you can tell it *is* one.
 *
 * Callers must capture the base's `.char` list BEFORE calling this.
 */
function dissect(el: Element, text: string): Element[] {
  if (!text) return []

  const bands: Element[] = []
  for (let i = 0; i < BANDS; i++) {
    const band = document.createElement('span')
    band.className = `dissect-band dissect-band--${i}`
    band.setAttribute('aria-hidden', 'true')

    for (const ch of text) {
      if (!ch.trim()) {
        band.appendChild(document.createTextNode(ch))
        continue
      }
      const cell = document.createElement('span')
      cell.className = 'char'
      cell.textContent = ch
      band.appendChild(cell)
    }

    el.appendChild(band)
    bands.push(band)
  }
  return bands
}

/**
 * Splits text into `.char` spans WITHOUT flattening markup.
 *
 * The previous implementation used `textContent` + `innerHTML`, which deleted
 * `<span class="accent">` — the Klein Blue full stop — from every hero title.
 * Element children are preserved and animated as a single unit.
 */
function splitChars(el: Element): void {
  if (el.hasAttribute('data-split')) return
  el.setAttribute('data-split', '')

  const frag = document.createDocumentFragment()
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const ch of node.textContent ?? '') {
        if (!ch.trim()) {
          frag.appendChild(document.createTextNode(ch))
          continue
        }
        const span = document.createElement('span')
        span.className = 'char'
        span.textContent = ch
        frag.appendChild(span)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ;(node as Element).classList.add('char')
      frag.appendChild(node)
    }
  }
  el.replaceChildren(frag)
}

export default defineEffect({
  id: 'reveal',
  targets:
    '.rise, .sec-head, .infobox, .rows li, .plate, .geo-frame, blockquote, .detail-aside, .detail-main, .xcard, .xlist li',

  run({ gsap, tier, S }) {
    let disarmed = false

    // ── Hero title: character stagger with real 3D depth ──────────────────
    const heroTitle = document.querySelector('.hero-title')
    if (heroTitle) {
      const label = visibleText(heroTitle)
      splitChars(heroTitle)
      // capture the base's characters first — `dissect` adds more `.char`
      // spans, and they must stay out of the stagger
      const chars = qa('.hero-title .char')
      const bands = dissect(heroTitle, label)
      if (bands.length) gsap.set(bands, { autoAlpha: 0 })
      if (chars.length) {
        const play = () =>
          gsap.fromTo(
            chars,
            {
              autoAlpha: 0,
              y: 50 * S.amp,
              z: -100 * S.amp,
              rotationX: -120 * S.amp,
              rotationZ: (i: number) => (i % 2 === 0 ? 10 : -10) * S.amp,
            },
            {
              autoAlpha: 1,
              y: 0,
              z: 0,
              rotationX: 0,
              rotationZ: 0,
              duration: S.dur * 1.3,
              ease: 'power4.out',
              stagger: { each: 0.04, from: 'start' },
            }
          )

        // The strips settle in just after the characters, so the word first
        // reads as a single form and then comes apart.
        const playBands = () => {
          gsap.to(bands, {
            autoAlpha: 0.92,
            duration: S.dur * 1.2,
            delay: 0.35,
            ease: 'power2.out',
          })
        }

        if (intro.playing) {
          // Hold the characters hidden behind the boot cover, then hand off.
          // `fromTo` (not `from`) because the hidden state is already applied.
          gsap.set(chars, { autoAlpha: 0 })
          intro.done.then(() => {
            if (disarmed) return
            play()
            playBands()
          })
        } else {
          play()
          playBands()
        }
      }
    }

    // ── Generic rise ──────────────────────────────────────────────────────
    const risers = qa('.rise').filter((el) => el !== heroTitle)
    if (risers.length) {
      gsap.fromTo(
        risers,
        { autoAlpha: 0, y: 20 * S.amp },
        {
          autoAlpha: 1,
          y: 0,
          duration: S.dur,
          ease: 'power2.out',
          stagger: S.stagger,
        }
      )
    }

    // ── Klein Blue markers pop in ─────────────────────────────────────────
    // (`.sec-no-dot` is a real element — CSS pseudo-elements cannot be
    // animated, and passing `::before` to querySelectorAll throws.)
    const nodes = qa('.sec-no-dot, .plate-node--blue, .annotation-node')
    if (nodes.length) {
      nodes.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
          }
        )
      })
    }

    // ── Geometric frames: rotate in ───────────────────────────────────────
    qa('.geo-frame').forEach((frame, i) => {
      const spin = [0, 90, 180, -90][i % 4]
      gsap.fromTo(
        frame,
        { rotation: spin + 360 * S.amp, scale: 0.5 + 0.5 * (1 - S.amp), autoAlpha: 0 },
        {
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
          duration: S.dur * 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: frame, start: 'top 88%', toggleActions: 'play none none none' },
        }
      )
    })

    // ── Section headers ───────────────────────────────────────────────────
    qa('.sec-head').forEach((header) => {
      const h2 = header.querySelector('h2')
      const no = header.querySelector('.sec-no')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: header, start: 'top 88%', toggleActions: 'play none none none' },
      })
      if (h2)
        tl.fromTo(
          h2,
          { autoAlpha: 0, x: -40 * S.amp },
          { autoAlpha: 1, x: 0, duration: S.dur, ease: 'power2.out' }
        )
      if (no)
        tl.fromTo(
          no,
          { autoAlpha: 0, x: 40 * S.amp },
          { autoAlpha: 1, x: 0, duration: S.dur, ease: 'power2.out' },
          '-=0.5'
        )
    })

    // ── Infoboxes + their leader lines ────────────────────────────────────
    qa('.infobox').forEach((box) => {
      gsap.fromTo(
        box,
        { autoAlpha: 0, x: -30 * S.amp },
        {
          autoAlpha: 1,
          x: 0,
          duration: S.dur * 1.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: box, start: 'top 88%', toggleActions: 'play none none none' },
        }
      )
      const leaders = qa('.infobox-leader').filter((l) => box.contains(l))
      if (leaders.length) {
        // `scaleX` only — the -3px optical offset lives in `top`, so this
        // tween no longer wipes it out.
        gsap.fromTo(
          leaders,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: box, start: 'top 84%', toggleActions: 'play none none none' },
          }
        )
      }
    })

    // ── Figure plates: layered reveal ─────────────────────────────────────
    qa('.plate').forEach((plate) => {
      const img = plate.querySelector('.plate-img')
      const overlay = plate.querySelector('.plate-overlay')
      const caption = plate.querySelector('.plate-caption')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: plate, start: 'top 78%', toggleActions: 'play none none none' },
      })
      if (img)
        tl.fromTo(
          img,
          { autoAlpha: 0, scale: 1 + 0.05 * S.amp },
          { autoAlpha: 1, scale: 1, duration: S.dur * 1.1, ease: 'power2.out' }
        )
      if (overlay) tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, '-=0.4')
      if (caption)
        tl.fromTo(
          caption,
          { autoAlpha: 0, x: -20 * S.amp },
          { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )
    })

    // ── Blockquotes ───────────────────────────────────────────────────────
    qa('blockquote').forEach((quote) => {
      gsap.fromTo(
        quote,
        { autoAlpha: 0, y: 14 * S.amp },
        {
          autoAlpha: 1,
          y: 0,
          duration: S.dur,
          ease: 'power2.out',
          scrollTrigger: { trigger: quote, start: 'top 90%', toggleActions: 'play none none none' },
        }
      )
    })

    // ── Measurement lines ─────────────────────────────────────────────────
    const measures = qa('.measure, .annotation-line')
    if (measures.length) {
      gsap.fromTo(
        measures,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 0.7,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: measures[0], start: 'top 92%', toggleActions: 'play none none none' },
        }
      )
    }

    // ── Lists: batched, so a 30-row page stays inside the trigger budget ──
    qa('.rows').forEach((list) => {
      const rows = Array.from(list.querySelectorAll('li'))
      if (!rows.length) return
      ScrollTrigger.batch(rows, {
        start: 'top 90%',
        interval: 0.08,
        batchMax: 6,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, x: -20 * S.amp },
            {
              autoAlpha: 1,
              x: 0,
              duration: S.dur * 0.8,
              ease: 'power1.out',
              stagger: S.stagger,
              overwrite: true,
            }
          ),
      })
    })

    // ── Experiment cards ──────────────────────────────────────────────────
    // ONE trigger for the whole grid, with `once: true`.
    //
    // A per-card ScrollTrigger.batch looked equivalent and was not: batch
    // triggers re-evaluate on every refresh, and filtergrid.ts refreshes on
    // every filter change — so cards that had just animated back in were
    // faded out from zero a second time, by a trigger that had nothing left
    // to do. Binding to the grid and killing the trigger on first play makes
    // the entrance unrepeatable, which is what "entrance" means.
    qa('.xgrid').forEach((gridEl) => {
      const cards = Array.from(gridEl.querySelectorAll('.xcard'))
      if (!cards.length) return
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 26 * S.amp },
        {
          autoAlpha: 1,
          y: 0,
          duration: S.dur,
          ease: 'power2.out',
          stagger: S.stagger,
          scrollTrigger: { trigger: gridEl, start: 'top 88%', once: true },
        }
      )
    })

    qa('.xlist').forEach((list) => {
      const rows = Array.from(list.querySelectorAll('li'))
      if (!rows.length) return
      ScrollTrigger.batch(rows, {
        start: 'top 92%',
        interval: 0.06,
        batchMax: 6,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, x: -14 * S.amp },
            {
              autoAlpha: 1,
              x: 0,
              duration: S.dur * 0.8,
              ease: 'power1.out',
              stagger: S.stagger,
              overwrite: true,
            }
          ),
      })
    })

    // ── Tag cloud (only exists on the archive index) ──────────────────────
    const cloud = document.querySelector('.tag-cloud')
    if (cloud) {
      gsap.fromTo(
        cloud.querySelectorAll('.tag'),
        { autoAlpha: 0, y: -10 * S.amp, rotationZ: (i: number) => (i % 2 === 0 ? 2 : -2) * S.amp },
        {
          autoAlpha: 1,
          y: 0,
          rotationZ: 0,
          duration: 0.5,
          ease: 'power1.out',
          stagger: { each: 0.04, from: 'random' },
          scrollTrigger: { trigger: cloud, start: 'top 85%', toggleActions: 'play none none none' },
        }
      )
    }

    // ── Detail page: three columns converge ───────────────────────────────
    if (document.querySelector('.detail')) {
      const tl = gsap.timeline()
      const left = document.querySelector('.detail-aside--left')
      const main = document.querySelector('.detail-main')
      const right = document.querySelector('.detail-aside--right')
      if (left)
        tl.fromTo(
          left,
          { autoAlpha: 0, x: -40 * S.amp },
          { autoAlpha: 1, x: 0, duration: S.dur, ease: 'power2.out' }
        )
      if (main)
        tl.fromTo(
          main,
          { autoAlpha: 0, y: 30 * S.amp },
          { autoAlpha: 1, y: 0, duration: S.dur * 1.15, ease: 'power2.out' },
          '-=0.4'
        )
      if (right)
        tl.fromTo(
          right,
          { autoAlpha: 0, x: 40 * S.amp },
          { autoAlpha: 1, x: 0, duration: S.dur, ease: 'power2.out' },
          '-=0.5'
        )
    }

    return () => {
      disarmed = true
    }
  },
})
