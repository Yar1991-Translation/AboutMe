import type { CollectionEntry } from 'astro:content'

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Rough length of a post. CJK is counted per character and everything else
 * per whitespace-separated word, because a "word count" is meaningless for
 * Chinese text — 300 latin words and 300 characters are nothing alike.
 */
export function getLength(body: string): { chars: number; minutes: number } {
  const cjk = (body.match(/[㐀-鿿぀-ヿ]/g) ?? []).length
  const words = (body.replace(/[㐀-鿿぀-ヿ]/g, ' ').match(/\b\w+\b/g) ?? [])
    .length
  const minutes = Math.max(1, Math.round((cjk / 400 + words / 220) * 10) / 10)
  return { chars: cjk + words, minutes }
}

/** Newest first, drafts excluded. Every listing and the RSS feed use this. */
export function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** Tags across all published posts, deduped and sorted. */
export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  const tags = new Set<string>()
  posts.forEach((post) => {
    if (!post.data.draft) {
      post.data.tags.forEach((tag) => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
}
