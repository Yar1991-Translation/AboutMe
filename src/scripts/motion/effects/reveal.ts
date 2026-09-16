/**
 * Entrance choreography — everything that plays once as an element arrives.
 *
 * Replaces the single monolithic block in Animations.astro. The behaviours are
 * unchanged; what changed is that each group is independently skippable and a
 * failure in one no longer takes the rest down.
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
      gsap.from(risers, {
        autoAlpha: 0,
        y: 20 * S.amp,
        duration: S.dur,
        ease: 'power2.out',
        stagger: S.stagger,
      })
    }

    // ── Klein Blue markers pop in ─────────────────────────────────────────
    // (`.sec-no-dot` is a real element — CSS pseudo-elements cannot be
    // animated, and passing `::before` to querySelectorAll throws.)
    const nodes = qa('.sec-no-dot, .plate-node--blue, .annotation-node')
    if (nodes.length) {
      nodes.forEach((el) => {
        gsap.from(el, {
          scale: 0,
          autoAlpha: 0,
          transformOrigin: '50% 50%',
          duration: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
        })
      })
    }

    // ── Geometric frames: rotate in ───────────────────────────────────────
    qa('.geo-frame').forEach((frame, i) => {
      const spin = [0, 90, 180, -90][i % 4]
      gsap.from(frame, {
        rotation: spin + 360 * S.amp,
        scale: 0.5 + 0.5 * (1 - S.amp),
        autoAlpha: 0,
        duration: S.dur * 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: frame, start: 'top 88%', toggleActions: 'play none none none' },
      })
    })

    // ── Section headers ───────────────────────────────────────────────────
    qa('.sec-head').forEach((header) => {
      const h2 = header.querySelector('h2')
      const no = header.querySelector('.sec-no')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: header, start: 'top 88%', toggleActions: 'play none none none' },
      })
      if (h2) tl.from(h2, { autoAlpha: 0, x: -40 * S.amp, duration: S.dur, ease: 'power2.out' })
      if (no) tl.from(no, { autoAlpha: 0, x: 40 * S.amp, duration: S.dur, ease: 'power2.out' }, '-=0.5')
    })

    // ── Infoboxes + their leader lines ────────────────────────────────────
    qa('.infobox').forEach((box) => {
      gsap.from(box, {
        autoAlpha: 0,
        x: -30 * S.amp,
        duration: S.dur * 1.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: box, start: 'top 88%', toggleActions: 'play none none none' },
      })
      const leaders = qa('.infobox-leader').filter((l) => box.contains(l))
      if (leaders.length) {
        // `scaleX` only — the -3px optical offset lives in `top`, so this
        // tween no longer wipes it out.
        gsap.from(leaders, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: box, start: 'top 84%', toggleActions: 'play none none none' },
        })
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
      if (img) tl.from(img, { autoAlpha: 0, scale: 1 + 0.05 * S.amp, duration: S.dur * 1.1, ease: 'power2.out' })
      if (overlay) tl.from(overlay, { autoAlpha: 0, duration: 0.6 }, '-=0.4')
      if (caption) tl.from(caption, { autoAlpha: 0, x: -20 * S.amp, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    })

    // ── Blockquotes ───────────────────────────────────────────────────────
    qa('blockquote').forEach((quote) => {
      gsap.from(quote, {
        autoAlpha: 0,
        y: 14 * S.amp,
        duration: S.dur,
        ease: 'power2.out',
        scrollTrigger: { trigger: quote, start: 'top 90%', toggleActions: 'play none none none' },
      })
    })

    // ── Measurement lines ─────────────────────────────────────────────────
    const measures = qa('.measure, .annotation-line')
    if (measures.length) {
      gsap.from(measures, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.7,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: measures[0], start: 'top 92%', toggleActions: 'play none none none' },
      })
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
          gsap.from(batch, {
            autoAlpha: 0,
            x: -20 * S.amp,
            duration: S.dur * 0.8,
            ease: 'power1.out',
            stagger: S.stagger,
            overwrite: true,
          }),
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
      gsap.from(cards, {
        autoAlpha: 0,
        y: 26 * S.amp,
        duration: S.dur,
        ease: 'power2.out',
        stagger: S.stagger,
        scrollTrigger: { trigger: gridEl, start: 'top 88%', once: true },
      })
    })

    qa('.xlist').forEach((list) => {
      const rows = Array.from(list.querySelectorAll('li'))
      if (!rows.length) return
      ScrollTrigger.batch(rows, {
        start: 'top 92%',
        interval: 0.06,
        batchMax: 6,
        onEnter: (batch) =>
          gsap.from(batch, {
            autoAlpha: 0,
            x: -14 * S.amp,
            duration: S.dur * 0.8,
            ease: 'power1.out',
            stagger: S.stagger,
            overwrite: true,
          }),
      })
    })

    // ── Tag cloud (only exists on the archive index) ──────────────────────
    const cloud = document.querySelector('.tag-cloud')
    if (cloud) {
      gsap.from(cloud.querySelectorAll('.tag'), {
        autoAlpha: 0,
        y: -10 * S.amp,
        rotationZ: (i) => (i % 2 === 0 ? 2 : -2) * S.amp,
        duration: 0.5,
        ease: 'power1.out',
        stagger: { each: 0.04, from: 'random' },
        scrollTrigger: { trigger: cloud, start: 'top 85%', toggleActions: 'play none none none' },
      })
    }

    // ── Detail page: three columns converge ───────────────────────────────
    if (document.querySelector('.detail')) {
      const tl = gsap.timeline()
      const left = document.querySelector('.detail-aside--left')
      const main = document.querySelector('.detail-main')
      const right = document.querySelector('.detail-aside--right')
      if (left) tl.from(left, { autoAlpha: 0, x: -40 * S.amp, duration: S.dur, ease: 'power2.out' })
      if (main)
        tl.from(main, { autoAlpha: 0, y: 30 * S.amp, duration: S.dur * 1.15, ease: 'power2.out' }, '-=0.4')
      if (right) tl.from(right, { autoAlpha: 0, x: 40 * S.amp, duration: S.dur, ease: 'power2.out' }, '-=0.5')
    }

    return () => {
      disarmed = true
    }
  },
})
