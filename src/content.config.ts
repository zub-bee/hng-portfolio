import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    projectName: z.string(),
    summary: z.string(),
    /** Placeholder dates derived from each project's year. Swap in real publish
     * dates when known - these feed sitemap lastmod and BlogPosting JSON-LD. */
    date: z.coerce.date(),
    /** Controls display order on /blog (ascending). */
    order: z.number(),
  }),
})

export const collections = { blog }
