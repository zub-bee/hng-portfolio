import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '../data/site.js'

export async function GET() {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )

  return rss({
    title: `${SITE.name} - Engineering Blog`,
    description: SITE.blogDescription,
    site: SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      categories: [post.data.projectName],
    })),
    customData: '<language>en-us</language>',
  })
}
