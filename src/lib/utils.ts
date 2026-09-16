import type { CollectionEntry } from 'astro:content'
import { STATUS_ORDER, type ExperimentStatus } from '../data/experiments'

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

/**
 * Experiments, grouped by how alive they still are.
 *
 * Deliberately NOT sorted newest-first like the blog. A note's value is mostly
 * fixed at the moment it is written; an experiment's value is entirely in its
 * current state, so something started in 2023 that is still being touched
 * belongs above something started last week and abandoned. Date only breaks
 * ties inside a status.
 */
export function sortExperiments(
  experiments: CollectionEntry<'experiments'>[]
): CollectionEntry<'experiments'>[] {
  const rank = (s: ExperimentStatus) => {
    const i = STATUS_ORDER.indexOf(s)
    return i === -1 ? STATUS_ORDER.length : i
  }
  return experiments
    .filter((e) => !e.data.draft)
    .sort(
      (a, b) =>
        rank(a.data.status) - rank(b.data.status) ||
        lastTouched(b).valueOf() - lastTouched(a).valueOf()
    )
}

/** The date an experiment actually last moved — `updated` when present, else `date`. */
export function lastTouched(entry: CollectionEntry<'experiments'>): Date {
  return entry.data.updated ?? entry.data.date
}

/** Every tag used by published experiments, deduped and sorted. */
export function getAllExperimentTags(
  experiments: CollectionEntry<'experiments'>[]
): string[] {
  const tags = new Set<string>()
  experiments.forEach((e) => {
    if (!e.data.draft) e.data.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/** Counts per status, for the stats panel and the filter bar. */
export function countByStatus(
  experiments: CollectionEntry<'experiments'>[]
): Record<string, number> {
  const counts: Record<string, number> = {}
  experiments.forEach((e) => {
    if (e.data.draft) return
    counts[e.data.status] = (counts[e.data.status] ?? 0) + 1
  })
  return counts
}
