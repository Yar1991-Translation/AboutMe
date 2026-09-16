/**
 * Copy MiSans Bold out of node_modules and into public/.
 *
 * A CJK webfont cannot be shipped as one file — the full face is megabytes and
 * a page uses a few hundred distinct characters. The `misans` package ships
 * MiSans pre-subsetted into 100 files with `unicode-range` declarations, which
 * is what makes this viable: the browser downloads only the handful of subsets
 * whose ranges the page actually touches.
 *
 * The package's own stylesheet is reused verbatim except for two edits:
 *
 *   - URLs are rewritten to the path the file is served from. The sheet uses
 *     bare relative names, which only resolve if the CSS sits next to the
 *     fonts — true in node_modules, not true in public/.
 *   - `font-weight` is widened from the single value Nokia shipped (630) to the
 *     full 100-900 range, so EVERY weight on the site resolves to Bold. That is
 *     the whole point of this file: the site has one Chinese weight. Paired with
 *     `font-synthesis-weight: none` in global.css, nothing can fake-bold on top
 *     of it either.
 *
 * Re-run with `npm run sync:fonts` after bumping the `misans` dependency.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'node_modules', 'misans', 'lib', 'Normal')
const SHEET = 'MiSans-Bold.min.css'
const OUT = join(ROOT, 'public', 'fonts', 'misans')

if (!existsSync(join(SRC, SHEET))) {
  console.error(`misans is not installed at ${SRC} — run \`npm install\` first`)
  process.exit(1)
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

let css = readFileSync(join(SRC, SHEET), 'utf8')

const referenced = [...new Set([...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]))]
let bytes = 0
for (const name of referenced) {
  copyFileSync(join(SRC, name), join(OUT, name))
  bytes += readFileSync(join(OUT, name)).length
}

css = css
  .replace(/url\('([^']+)'\)/g, "url('/fonts/misans/$1')")
  .replace(/font-weight:630/g, 'font-weight:100 900')

writeFileSync(join(OUT, 'misans-bold.css'), css)

// Apache-2.0 — the notice travels with the files.
copyFileSync(join(ROOT, 'node_modules', 'misans', 'LICENSE'), join(OUT, 'LICENSE.txt'))

console.log(
  `synced ${referenced.length} subsets (${(bytes / 1024).toFixed(0)} KB) + stylesheet -> public/fonts/misans/`
)
console.log('the browser fetches only the subsets a page needs; the rest never leave the server.')
