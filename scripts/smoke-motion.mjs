/**
 * Smoke-test the built motion bundle against the built HTML.
 *
 * jsdom has no layout engine, so ScrollTrigger's measured positions are all
 * zero. That's fine — this isn't checking whether the animations look right.
 * It checks the thing a build can never catch: whether the bundle THROWS at
 * load, and whether any individual effect reported itself as failed. One
 * unguarded `::before` selector did exactly that and silently disabled every
 * animation on the site.
 */
import { readFileSync, readdirSync, copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'

const DIST = process.argv[2]
const ASTRO = join(DIST, '_astro')

/* The harness has to copy the bundle next to itself to import it by URL, and
   it used to do that into `scripts/` — which quietly littered the repo with
   hashed chunks on every run. Give it its own gitignored scratch dir. */
const HERE = join(dirname(fileURLToPath(import.meta.url)), '..', '.smoke')
rmSync(HERE, { recursive: true, force: true })
mkdirSync(HERE, { recursive: true })

// Copy the WHOLE _astro dir — the entry is the small hoisted chunk, which
// imports the big one by relative path.
const bundleSrc = readdirSync(ASTRO).find((f) => f.startsWith('hoisted.') && f.endsWith('.js'))
const bundlePath = join(HERE, 'bundle.mjs')
for (const f of readdirSync(ASTRO)) {
  copyFileSync(join(ASTRO, f), join(HERE, f))
}
copyFileSync(join(ASTRO, bundleSrc), bundlePath)

// One page per process — module-level GSAP state would otherwise leak between
// pages and mask real failures.
// Defaults cover one page per effect family: the hero/ticker/grid on the
// index, the filter bar + Flip + meters on the bench, a plate-heavy detail
// page, and a plain route with none of the above.
const pages = process.argv[3]
  ? [process.argv[3]]
  : [
      'index.html',
      'experiments/index.html',
      'experiments/motion-lab/index.html',
      'blog/index.html',
      'about/index.html',
    ]

// jsdom under-reports these; the site only uses them as feature probes.
const mkMedia = (q) => ({
  matches: /min-width:\s*96[01]px/.test(q) || /hover:\s*hover/.test(q),
  media: q,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  onchange: null,
  dispatchEvent: () => false,
})

let failed = 0

for (const page of pages) {
  const html = readFileSync(join(DIST, page), 'utf8')

  const dom = new JSDOM(html, {
    url: `https://example.test/${page.replace('index.html', '')}`,
    pretendToBeVisual: true,
    // 'outside-only' = don't run the page's own scripts (jsdom can't do ES
    // modules); we import the bundle ourselves below.
    runScripts: 'outside-only',
  })

  const { window } = dom

  window.matchMedia = mkMedia
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.Element.prototype.getBoundingClientRect = () => ({
    top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
  })
  window.Element.prototype.getClientRects = () => {
    const r = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0 }
    return Object.assign([r], { item: () => r })
  }
  /* jsdom implements no SVG geometry at all, and three of the plugins reach
     straight into it: DrawSVG measures with getBBox/getTotalLength, and Flip's
     absolute mode reads bounding boxes on every node it moves. Without these
     stubs the harness reports failures that are jsdom's gaps, not the site's. */
  const box = { x: 0, y: 0, width: 120, height: 120, top: 0, left: 0, right: 120, bottom: 120 }
  window.SVGElement.prototype.getBBox = () => box
  window.SVGElement.prototype.getTotalLength = () => 120
  window.SVGElement.prototype.getPointAtLength = () => ({ x: 0, y: 0 })
  window.SVGElement.prototype.getScreenCTM = () => ({
    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
    inverse() { return this },
    multiply() { return this },
  })

  window.scrollTo = () => {}
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
  window.cancelAnimationFrame = (id) => clearTimeout(id)
  window.document.fonts = { ready: Promise.resolve() }
  Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })

  // The page's synchronous head script would have set this; jsdom didn't run it.
  window.document.documentElement.classList.add('js-motion')

  // Install the globals GSAP/ScrollTrigger/IntersectionObserver reach for.
  const saved = {}
  const globals = {
    window,
    document: window.document,
    navigator: window.navigator,
    location: window.location,
    history: window.history,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    matchMedia: window.matchMedia,
    IntersectionObserver: window.IntersectionObserver,
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    Node: window.Node,
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    getComputedStyle: window.getComputedStyle.bind(window),
    // GSAP/ScrollTrigger reference these as bare globals — in a browser they
    // resolve to window.*, but inside a Node ES module they don't.
    scrollX: 0,
    scrollY: 0,
    pageXOffset: 0,
    pageYOffset: 0,
    innerWidth: 1440,
    innerHeight: 900,
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  }
  const define = (k, v) =>
    Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true })
  for (const [k, v] of Object.entries(globals)) {
    saved[k] = globalThis[k]
    define(k, v)
  }

  const errors = []
  const onErr = (e) => errors.push(`uncaught: ${e.message}`)
  const onRej = (e) => errors.push(`unhandled rejection: ${e?.message ?? e}`)
  process.on('uncaughtException', onErr)
  process.on('unhandledRejection', onRej)

  const warnings = []
  const origWarn = console.warn
  console.warn = (...a) => warnings.push(a.map(String).join(' '))

  try {
    // Cache-bust so each page gets a fresh module evaluation.
    await import(`${pathToFileURL(bundlePath).href}?p=${encodeURIComponent(page)}`)
  } catch (err) {
    errors.push(`THROW loading bundle: ${err?.message}`)
  }

  // Let the kernel boot and a few frames run.
  await new Promise((r) => setTimeout(r, 250))

  console.warn = origWarn
  process.off('uncaughtException', onErr)
  process.off('unhandledRejection', onRej)

  const root = window.document.documentElement
  const failedEffects = Array.from(root.attributes)
    .filter((a) => a.name.startsWith('data-motion-failed-'))
    .map((a) => a.name.replace('data-motion-failed-', ''))

  console.log(`\n=== ${page} ===`)
  console.log(`  html classes     : ${root.className || '(none)'}`)
  console.log(`  motion-ready     : ${root.classList.contains('motion-ready')}`)
  console.log(`  data-motion-tier : ${root.getAttribute('data-motion-tier') ?? '(unset)'}`)
  console.log(`  FAILED EFFECTS   : ${failedEffects.length ? failedEffects.join(', ') : 'none'}`)
  const count = (sel) => window.document.querySelectorAll(sel).length
  console.log(`  injected nodes   : hud=${count('.hud')} grid=${count('.grid-layer')} ghosts=${count('.ghost-layer')} reticle=${count('.reticle')} intro=${count('.intro')}`)
  console.log(`  new surfaces     : ticker-sets=${count('.ticker-set')} nav-sentinel=${count('.nav-sentinel')} meters=${count('.meter-fill')} xcards=${count('.xcard')} filter-btns=${count('.fbtn')}`)

  // Meters and count-ups must be readable even if an effect was skipped: the
  // authored value lives in CSS/HTML precisely so nothing reports 0.
  const meters = Array.from(window.document.querySelectorAll('.meter'))
  if (meters.length) {
    const sample = meters
      .slice(0, 4)
      .map((m) => `${m.getAttribute('data-meter')}%→--meter:${m.style.getPropertyValue('--meter') || '(unset)'}`)
    console.log(`  meter fallback   : ${sample.join('  ')}`)
  }

  const motionWarnings = warnings.filter((w) => w.includes('[motion]') || w.includes('GSAP') || w.includes('Invalid'))
  if (motionWarnings.length) {
    console.log(`  MOTION WARNINGS  :`)
    motionWarnings.slice(0, 10).forEach((w) => console.log(`    ${w}`))
  }

  if (errors.length) {
    console.log(`  ERRORS:`)
    errors.forEach((e) => console.log(`    ${e}`))
  }

  if (errors.length || failedEffects.length || motionWarnings.length) failed++

  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete globalThis[k]
    else define(k, v)
  }
  window.close()
}

console.log(`\n${failed === 0 ? 'PASS — bundle loads clean on every page' : `FAIL (${failed} page(s))`}`)
process.exit(failed === 0 ? 0 : 1)
