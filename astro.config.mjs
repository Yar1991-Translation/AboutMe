import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'

export default defineConfig({
  // Canonical origin. Feeds every canonical URL, og:url and the RSS links.
  site: 'https://about.yatmt.site',
  output: 'static',
  // No sitemap integration. @astrojs/sitemap was a declared-but-unused
  // dependency; registering it crashes the build on this Astro version
  // (4.16) because 3.7.4 reads an Astro internals field (`_routes`) that
  // 4.x does not provide. Re-add it pinned to a 4.x-compatible release.
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      // `css-variables` emits custom properties instead of baked-in hex, so the
      // token colours are defined in global.css against the site palette
      // rather than importing github's rainbow — and they can flip with
      // [data-theme]. A fixed `github-light` theme painted a white box with
      // dark text onto the dark theme.
      theme: 'css-variables',
      wrap: true,
    },
  },
})
