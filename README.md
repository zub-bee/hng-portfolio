# Deborah Anyachukwu - Backend Engineer Portfolio

Portfolio page showcasing my backend work during the HNG internship. Built with Astro and Tailwind CSS, prerendered to static HTML.

## Stack

- Astro 7 (static output, zero client framework)
- Tailwind CSS v4
- Markdown content collections
- Deployed on Vercel

## What This Portfolio Communicates

I wanted anyone to open this page and walk away knowing exactly what I can build as a backend engineer. The projects listed are real systems I shipped and the featured deep-dive shows how I think through architecture decisions.

## Structure

```
src/
  content/blog/     posts as markdown + frontmatter
  content.config.ts collection schema
  data/             site identity, projects, skills, reflections
  layouts/          shared page shell (head, hero, contact, footer)
  components/       Icon, LinkPreview
  scripts/          theme, scroll, copy, hover previews - plain TS, no framework
  pages/            one file per route
```

Every page is prerendered at build time, so post content is in the HTML rather than injected by JS. That matters for search engines and, more so, for social crawlers like LinkedIn and X, which never run JavaScript.

## Running Locally

```bash
pnpm install
pnpm dev
```

## Building for Production

```bash
pnpm build
pnpm preview
```

## Adding a blog post

Drop a `.md` file into `src/content/blog/` with this frontmatter:

```yaml
---
title: 'Post title'
projectName: 'Which project it covers'
summary: 'One or two sentences, used in the list and as the meta description.'
date: 2026-06-01
order: 5
---
```

The filename becomes the URL: `src/content/blog/my-post.md` serves at `/blog/my-post/`. Posts appear on `/blog/` in `order` ascending. The sitemap and RSS feed pick it up automatically.

Markdown headings start at `#` and are shifted down one level at build time so they nest correctly under the page's `<h1>`. Images go in `public/images/` and are referenced absolutely, e.g. `![description](/images/thing.png)`.
