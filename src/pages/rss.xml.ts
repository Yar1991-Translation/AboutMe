import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { site } from '../data/site'
import { sortPostsByDate } from '../lib/utils'

export async function GET(context: any) {
  const allPosts = await getCollection('blog')
  const posts = sortPostsByDate(allPosts)
  
  return rss({
    title: site.name,
    description: site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>zh-CN</language>`,
  })
}
