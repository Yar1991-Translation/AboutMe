import type { CollectionEntry } from 'astro:content'

export function getReadingTime(content: string): number {
  const wordsPerMinute = 300
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  const tags = new Set<string>()
  posts.forEach((post) => {
    if (!post.data.draft) {
      post.data.tags.forEach((tag) => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
}

export function filterPostsByTag(posts: CollectionEntry<'blog'>[], tag: string | null): CollectionEntry<'blog'>[] {
  if (!tag) return posts
  return posts.filter((post) => post.data.tags.includes(tag))
}
