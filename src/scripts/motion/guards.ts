/**
 * Selector safety.
 *
 * `gsap.utils.toArray(str)` forwards the string straight to
 * `document.querySelectorAll` (see gsap-core.js:671). Querying a
 * pseudo-element like `.sec-no::before` throws a SyntaxError, and because
 * that throw happens inside the animation-setup callback it takes down every
 * animation registered after it.
 *
 * That is exactly how this site's motion system died: one `::before` in a
 * selector list at Animations.astro:80 aborted the remaining ~30 effects,
 * including all parallax. Every selector that reaches GSAP goes through
 * `qa()` first.
 */
export function qa(selector: string): Element[] {
  if (selector.includes('::')) {
    console.warn(`[motion] refused pseudo-element selector: ${selector}`)
    return []
  }
  try {
    return Array.from(document.querySelectorAll(selector))
  } catch (err) {
    console.warn(`[motion] invalid selector: ${selector}`, err)
    return []
  }
}

/** First match, or null. Same safety as `qa`. */
export function q1<T extends Element = Element>(selector: string): T | null {
  return (qa(selector)[0] as T) ?? null
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Text of an element with decorative duplicates removed.
 *
 * The ghost and dissect layers are full copies of the heading text marked
 * `aria-hidden`. A plain `textContent` read picks them up, so the HUD was
 * reporting the hero as "ARCHIVE.ARCHIVE.AR" — the real heading concatenated
 * with its own echoes.
 */
export function visibleText(el: Element): string {
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim()
}
