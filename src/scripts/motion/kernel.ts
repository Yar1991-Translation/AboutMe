/**
 * Motion kernel — registry, tier resolution, failure isolation, teardown.
 *
 * Design contract, in order of importance:
 *
 * 1. FAILURE IS CONTAINED. Each effect gets its own `gsap.matchMedia` context
 *    and its own try/catch. A throw kills that effect's ScrollTriggers and
 *    reverts its inline styles; everything else keeps running. The previous
 *    single-callback design meant one bad selector silently disabled the
 *    entire site's motion.
 *
 * 2. NO EFFECT IS EVER SILENTLY INVISIBLE. If an effect fails or is skipped,
 *    `<html>` gets `mr-<id>`, which releases any CSS pre-hidden state.
 *
 * 3. TEARDOWN IS COMPLETE. `disarm()` reverts every context and kills every
 *    ScrollTrigger, so this can be re-armed on each navigation once view
 *    transitions are switched on.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TIER, type Tier, state, onFrame, runFrame, clearFrames, resetState } from './state'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
export { TIER }
export type { Tier }

/**
 * Breakpoints mirror global.css exactly. `desktop` starts at 961px because the
 * stylesheet's mobile block is `max-width: 960px` — the old `min-width: 960px`
 * overlapped it, and everything below 960px got no animation at all.
 */
export const QUERIES = {
  desktop: '(min-width: 961px)',
  mobile: '(max-width: 960px)',
  reduce: '(prefers-reduced-motion: reduce)',
}

export interface Scale {
  /** generic multiplier for entrance distances / rotations */
  amp: number
  /** base tween duration */
  dur: number
  /** per-item stagger */
  stagger: number
  /** parallax depth multiplier */
  parallax: number
  /** velocity field strength */
  velocity: number
  /** number of echo layers under headings */
  ghosts: number
  /** broken-grid drift multiplier */
  drift: number
  /** whether the fixed instrument overlay renders */
  hud: boolean
}

export const SCALE: Record<Tier, Scale> = {
  [TIER.OFF]: { amp: 0, dur: 0, stagger: 0, parallax: 0, velocity: 0, ghosts: 0, drift: 0, hud: false },
  [TIER.MOBILE]: { amp: 0.55, dur: 0.5, stagger: 0.035, parallax: 0.04, velocity: 0.6, ghosts: 1, drift: 0, hud: false },
  [TIER.DESKTOP]: { amp: 1, dur: 0.7, stagger: 0.07, parallax: 0.085, velocity: 1, ghosts: 2, drift: 1, hud: true },
}

export interface EffectCtx {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  tier: Tier
  S: Scale
  conditions: Record<string, boolean>
  root: HTMLElement
}

export interface Effect {
  id: string
  /** Effects below this tier never run. Defaults to MOBILE. */
  minTier?: Tier
  /** Cheap pre-check. Returning false skips the effect entirely — this is what
   *  stops selectors that only exist on some pages from creating triggers
   *  that resolve to <body>. */
  when?: () => boolean
  /** Selectors this effect writes inline transforms to. Used to undo a
   *  half-applied state if the effect throws. */
  targets?: string
  run: (ctx: EffectCtx) => void | (() => void)
}

const effects: Effect[] = []
export const defineEffect = (effect: Effect): void => {
  effects.push(effect)
}

const root = document.documentElement
let mm: gsap.MatchMedia | null = null
let tickerFn: ((time: number, delta: number) => void) | null = null
let booted = false

const release = (id: string) => root.classList.add(`mr-${id}`)

const fail = (id: string, err: unknown) => {
  console.warn(`[motion] effect "${id}" failed and was skipped`, err)
  root.setAttribute(`data-motion-failed-${id}`, '')
  release(id)
}

function tierOf(conditions: Record<string, boolean>): Tier {
  if (conditions.reduce) return TIER.OFF
  if (conditions.desktop) return TIER.DESKTOP
  if (conditions.mobile) return TIER.MOBILE
  return TIER.OFF
}

function applyTier(tier: Tier) {
  state.tier = tier
  root.setAttribute('data-motion-tier', String(tier))
}

export function boot(): void {
  if (booted) return
  booted = true

  /* Everything below is individually guarded, but "individually guarded" is a
     claim about today's code. `motion-ready` is the only thing standing
     between a reader and a page whose every `.rise` is at opacity 0, so it is
     released unconditionally — including on a throw nobody predicted. */
  try {
    bootInternal()
  } catch (err) {
    console.warn('[motion] boot threw; the pre-hidden state is being released anyway', err)
  } finally {
    root.classList.add('motion-ready')
  }
}

function bootInternal(): void {
  mm = gsap.matchMedia()
  tickerFn = (time, delta) => runFrame(time, delta)
  gsap.ticker.add(tickerFn)

  for (const def of effects) {
    try {
      if (def.when && !def.when()) {
        release(def.id)
        continue
      }
    } catch (err) {
      fail(def.id, err)
      continue
    }

    try {
      // One matchMedia context per effect → `mm` reverts them independently,
      // and each one re-runs on its own when the tier changes.
      mm.add(QUERIES, (ctx) => {
        const conditions = ctx.conditions as Record<string, boolean>
        const tier = tierOf(conditions)
        applyTier(tier)

        if (tier === TIER.OFF || tier < (def.minTier ?? TIER.MOBILE)) {
          release(def.id)
          return
        }

        const before = new Set(ScrollTrigger.getAll())

        try {
          const cleanup = def.run({
            gsap,
            ScrollTrigger,
            tier,
            S: SCALE[tier],
            conditions,
            root,
          })
          release(def.id)
          return typeof cleanup === 'function' ? cleanup : undefined
        } catch (err) {
          // Roll back only what THIS effect did.
          fail(def.id, err)
          ScrollTrigger.getAll().forEach((t) => {
            if (!before.has(t)) t.kill()
          })
          if (def.targets) gsap.set(def.targets, { clearProps: 'all' })
        }
      })
    } catch (err) {
      fail(def.id, err)
    }
  }

  scheduleRefresh(0)
  document.fonts?.ready.then(() => scheduleRefresh(0))
  /* Only while the document is still loading. `boot` runs again on every
     navigation, and a `load` listener added after `load` has already fired
     never fires and is never removed — one dead listener per page visited. */
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => scheduleRefresh(0), { once: true })
  }

  // The URL bar showing/hiding on mobile fires a resize; without this every
  // one of those triggers a full ScrollTrigger recalculation.
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export function disarm(): void {
  if (!booted) return
  booted = false

  /* Teardown, not setup. If it throws halfway the layer has to stay re-armable,
     so the flag is cleared first and the body is contained. */
  try {
    teardown()
  } catch (err) {
    console.warn('[motion] teardown threw; the layer stays re-armable', err)
  }
}

function teardown(): void {
  if (mm) {
    mm.kill()
    mm = null
  }
  ScrollTrigger.getAll().forEach((t) => t.kill())

  if (tickerFn) {
    gsap.ticker.remove(tickerFn)
    tickerFn = null
  }
  clearFrames()
  resetState()

  root.removeAttribute('data-motion-tier')
  root.classList.remove('motion-ready', 'js-motion', 'is-scrolling')
  root.style.removeProperty('--vint')
  root.style.removeProperty('--vmag')
  Array.from(root.attributes)
    .filter((a) => a.name.startsWith('data-motion-failed-'))
    .forEach((a) => root.removeAttribute(a.name))
  root.className = root.className.replace(/\bmr-\S+/g, '').trim()
}

let refreshQueued = false
/** Coalesce every refresh request (boot, load, font swap, resize) into one. */
export function scheduleRefresh(delay = 120): void {
  if (refreshQueued) return
  refreshQueued = true
  window.setTimeout(() => {
    refreshQueued = false
    ScrollTrigger.refresh()
  }, delay)
}

/**
 * Applies a signed value to a custom property, quantised.
 *
 * Writing a custom property on <html> invalidates style for every consumer in
 * the document, so an unquantised per-frame write is a style recalc per frame.
 * Stepping to 0.02 caps it at ~51 distinct writes per direction while staying
 * visually continuous.
 */
export const quantise = (v: number, step = 0.02): number => Math.round(v / step) * step

export { state, onFrame }
