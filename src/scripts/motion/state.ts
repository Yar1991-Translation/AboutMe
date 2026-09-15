/**
 * Shared frame state + a single frame bus.
 *
 * Exactly ONE gsap.ticker callback exists in the whole app (registered by the
 * kernel). Every effect that needs per-frame work subscribes through `onFrame`
 * instead of adding its own ticker — otherwise N modules each walk the DOM on
 * every frame.
 */

export const TIER = { OFF: 0, MOBILE: 1, DESKTOP: 2 } as const
export type Tier = (typeof TIER)[keyof typeof TIER]

export const state = {
  tier: TIER.DESKTOP as Tier,
  /** signed, normalised scroll velocity — roughly -1..1 */
  v: 0,
  /** unsigned magnitude of `v`, 0..1. Exists so CSS can use it in calc()
   *  without needing abs(). */
  mag: 0,
  /** 1 scrolling down, -1 scrolling up */
  dir: 1,
  /** document scroll progress, 0..1 */
  progress: 0,
  /** code of the section currently in view, e.g. "SEC. 03 — LOG" */
  section: '',
}

type FrameFn = (time: number, delta: number) => void
const subs = new Set<FrameFn>()

export const onFrame = (fn: FrameFn): (() => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}

export const runFrame = (time: number, delta: number): void => {
  subs.forEach((fn) => fn(time, delta))
}

export const clearFrames = (): void => subs.clear()

export const resetState = (): void => {
  state.v = 0
  state.mag = 0
  state.dir = 1
  state.progress = 0
  state.section = ''
}

/**
 * Handshake between the boot sequence and the entrance choreography.
 *
 * The intro overlay covers the screen for ~1.2s; if the hero animation ran
 * underneath it the user would just see an already-settled page when the
 * overlay opens. The intro registers first (see effects/index order) and
 * replaces `done` with a promise it resolves as the overlay opens.
 */
export const intro = {
  playing: false,
  done: Promise.resolve() as Promise<void>,
  finish: (() => {}) as () => void,
}

