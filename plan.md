# Exited Plan Mode

# Convert the React/Vite portfolio to Astro

## Context

The site is a single-page React app: one 1112-line `src/app/App.tsx`, four markdown blog posts, three
images. It ships React + Radix + framer-motion + react-markdown to render what is, functionally, static
text. The goal is SEO and shedding weight.

Three things I found while reading the code change what this migration should actually do:

**1. The site is currently blocked from search engines.** `index.html:11` has
`<meta name="robots" content="noindex, nofollow" />`. Google is being explicitly told not to index this
page. No framework change affects this — Astro would produce beautifully rendered HTML that Google still
ignores. This is a one-line fix and it is the single highest-impact SEO change in this document. Confirmed
unintentional (scaffold default), so it gets removed.

**2. Every page shares one URL.** Routing is hash-based (`getViewFromHash`, `App.tsx:239-248`) — `#/blog`,
`#/blog/<slug>`. Search engines discard fragments, so all four blog posts and the home page are one
indexable URL with one title and one meta description. This is the second real SEO problem, and it is the
one Astro genuinely fixes.

**3. The "overkill" is not React — it is the unused dependency tree.** `package.json` lists 60 runtime
dependencies. The app imports exactly one of the ~50 shadcn components in `src/app/components/ui/`:
`link-preview.tsx`. MUI, recharts, react-dnd, react-slick, embla, cmdk, vaul, sonner, react-hook-form,
date-fns, react-router and ~40 others are dead weight from the Figma Make scaffold. Deleting them is worth
more than the framework swap.

Outcome: five real URLs with per-page metadata, markdown rendered at build time, near-zero client JS, and
a dependency list that fits on one screen.

## Why Astro rather than fixing the SPA in place

Worth recording, since two of the three problems above are fixable without changing frameworks.

Removing `noindex` and switching to history-based routing would get most of the indexing benefit while
staying on Vite. What it cannot fix: **social crawlers do not execute JavaScript.** LinkedIn, X, WhatsApp
and Slack fetch the HTML, read the meta tags, and leave. Every shared blog-post link would keep showing one
generic card regardless of how good the client-side routing is. Google can render JS, so indexing would
likely survive; social previews would not. That requires prerendered HTML per URL.

Astro is not the only way there — `vite-react-ssg` or a Next.js static export would prerender React and
preserve the existing components. Astro wins on defaults: React frameworks hydrate by default and you opt
out, Astro ships zero JS by default and you opt in. With four markdown posts and no application state,
that default is the whole difference, and markdown moves from browser-side parsing to build-time parsing —
the single largest win available under any framework.

Note that the ~40 unused dependencies do _not_ contribute to page weight; Vite tree-shakes them. They cost
install time and audit surface. The actual shipped set is react, react-dom, react-markdown + remark-gfm +
rehype-raw, Radix hover-card, framer-motion, and lucide icons. Measure with a production build before/after
if a hard number is wanted.

## Decisions I made for you

`AskUserQuestion` was unavailable in this session, so I picked defaults. Each is cheap to reverse — tell me
on review and I will adjust before writing code.

| Decision       | Choice                              | Why                                                                                           |
| -------------- | ----------------------------------- | --------------------------------------------------------------------------------------------- |
| Hover previews | Rewrite in vanilla JS/CSS           | See below — keeping React here would defeat the migration                                     |
| Host           | Vercel, static output               | `README.md` and `@vercel/analytics` both confirm it                                           |
| Domain         | `https://zubbee.vercel.app`         | Confirmed by user                                                                             |
| Post dates     | Project year/month, placeholder day | Git says all four posts landed 2026-08-15 (history was recommitted), so git dates are useless |
| Images         | Stay in `public/`, fix paths only   | 88 KB total — an optimization pipeline would cost more than it saves                          |

**On the hover previews.** `LinkPreview` is the one genuinely interactive piece, and it wraps _nearly every
link on the site_ — nav, social icons, project links, API endpoints, blog links, and every link inside
markdown. Keeping it as a React island means shipping react + react-dom + Radix + framer-motion on every
page, which leaves the bundle roughly where it started. It also doesn't port cleanly: `.astro` files cannot
pass JSX props to an island, and `previewContent` is JSX at ten call sites.

The rewrite is tractable because every preview is the same card shape — eyebrow, title, description, and
optionally a badge or icon. One delegated hover handler on `document`, one shared popover element, and
`data-preview-*` attributes on anchors replaces all of it in ~80 lines with no dependencies. It is also
_better_ than the current setup for markdown links: a rehype plugin can stamp `data-preview` onto generated
anchors, where react-markdown needed a component override. Cost: the framer-motion spring becomes a CSS
transition. Very close, not byte-identical.

**Two bugs to fix in passing:**

- `link-preview.tsx:65-70` preloads a microlink screenshot for every external link on mount, _including the
  ~10 links that pass `previewContent`_ and therefore never display that image. That is roughly 15 wasted
  requests to `api.microlink.io` on every page load. The rewrite fetches on hover only.
- Theme never persists — `useState(true)` at `App.tsx:390` means the site resets to dark on every reload,
  and applying it in a `useEffect` flashes. The replacement is a blocking inline script reading
  `localStorage`.

## Target structure

```
astro.config.mjs          site URL, sitemap, markdown plugins
src/
  content.config.ts       blog collection schema (title, projectName, summary, date)
  content/blog/*.md       + frontmatter (moved out of blogPosts.ts)
  data/site.ts            name, email, socials, domain
  data/projects.ts        the projects[] array, verbatim
  data/skills.ts          skills[] + reflections[], verbatim
  layouts/BaseLayout.astro    head/meta/OG/JSON-LD, theme script, gradient, header, contact, footer
  components/
    Icon.astro            11 inlined lucide SVG paths — drops the lucide-react dep
    LinkPreview.astro     renders <a data-preview-*>
    ThemeToggle.astro
    CopyEmail.astro
    BackToTop.astro
  scripts/link-preview.ts shared popover + delegated hover
  pages/
    index.astro           hero + skills + projects + featured + reflections
    blog/index.astro      post list
    blog/[slug].astro     getStaticPaths over the collection
    404.astro
    rss.xml.ts
  styles/global.css       merge of fonts/tailwind/theme/globals + .prose rules
public/
  images/*.png            unchanged
  robots.txt              new
```

URLs: `/`, `/blog/`, `/blog/<slug>/` — one per post, each with its own title, description, canonical, and
`BlogPosting` JSON-LD.

## Implementation

**1. Scaffold.** New `astro.config.mjs` with `@astrojs/sitemap`, `@tailwindcss/vite`, and `site` set to the
domain constant. Rewrite `package.json` down to: `astro`, `@astrojs/rss`, `@astrojs/sitemap`, `tailwindcss`,
`@tailwindcss/vite`, `@vercel/analytics`. That is 6 down from 66. Delete `components.json` and
`vite.config.ts` (the `figmaAssetResolver` plugin resolves `figma:asset/` imports into `src/assets`, a
directory that does not exist and is imported by nothing).

**2. Content collections.** Add frontmatter to the four files in `src/content/blog/`, lifting `title`,
`projectName`, and `summary` verbatim from `src/content/blogPosts.ts`, plus a `date`. Dates take the year and month from
each project's `year` field in `App.tsx` with a placeholder day — Insighta `2026-04-01`, Retry Engine
`2026-05-01`, SkillBridge `2026-05-01`, Zubbee Scheduler `2026-06-01`. These are stand-ins; swap in real
publish dates when convenient, since they feed sitemap `lastmod` and `BlogPosting` structured data. This
also replaces the hardcoded "June 2026" shown for every post at `App.tsx:982`. Then delete
`blogPosts.ts`. Also fix the three image paths in
`http-retry-engine.md:34-38` from `images/image.png` to `/images/image.png`; this makes
`normalizeMarkdownImageUrl` (`App.tsx:38-48`) unnecessary and it goes away.

**3. Markdown rendering.** Astro renders markdown at build and passes raw HTML through by default, so the
YouTube `<iframe>` at `zubbee-scheduler.md:17` survives without `rehype-raw`. GFM is on by default, so
`remark-gfm` goes too. Two small local rehype plugins in `astro.config.mjs`, no new deps:

- _heading shift_ — demotes h1→h2, h2→h3, h3→h4, reproducing the remapping in `BlogMarkdown`
  (`App.tsx:68-86`) that keeps the document outline correct under the page's real `<h1>`.
- _link decorator_ — adds the rose link classes and `data-preview` to every markdown anchor.

The 14 component overrides in `BlogMarkdown` (`App.tsx:50-176`) become CSS rules under `.prose` in
`global.css`. Every class and inline style is copied across one-for-one — this is the fidelity-critical step
and the one to eye carefully in review. The `img` and `iframe` wrapper `<div>`s are reproduced with
`.prose img` / `.prose iframe` styling directly, since a wrapper element isn't available. I'll add
`loading="lazy"` to the YouTube iframe while I'm there; it currently loads eagerly on the Zubbee post.

**4. Layout and pages.** `BaseLayout.astro` takes `title`, `description`, and optional `ogType`/`date`,
and owns everything from the fixed scroll gradient (`App.tsx:442-451`) through the footer. The three
sections currently gated on `view === "home"` become `index.astro`; the two blog branches become
`blog/index.astro` and `blog/[slug].astro`. Markup is copied verbatim — same Tailwind classes, same inline
styles, same structure. The dark/light class pairs (`bg`, `border`, `borderStrong` at `App.tsx:433-435`)
switch from JS ternaries to Tailwind `dark:` variants, since the theme is now a class on `<html>` set before
paint rather than React state.

**5. Interactivity** — four small scripts, no framework:

- _theme_ — blocking inline script in `<head>` reads `localStorage`, falls back to dark, sets the class
  before first paint. The toggle keeps the `startViewTransition` circular reveal from `App.tsx:516-543`
  intact; `globals.css` already has the keyframes and moves over unchanged.
- _link previews_ — the shared popover described above.
- _copy email_ — `navigator.clipboard` + the 1.5s check-icon swap (`App.tsx:424-428`).
- _scroll_ — gradient opacity (`App.tsx:411-422`) and back-to-top.

**6. Old hash URLs.** `#/blog/<slug>` links that are already shared will land on `/` and show the home page.
A server redirect cannot fix this — the fragment is never sent to the server, which is a common way to get
this wrong. It needs ~6 lines in the head script: read `location.hash`, map it to the clean path,
`location.replace`. Runs before paint so there is no visible bounce.

**7. SEO layer.** Remove the `noindex`. Per-page `<title>`, meta description, and canonical. OG and Twitter
card tags. `Person` + `ProfilePage` JSON-LD on home, `BlogPosting` on posts. `@astrojs/sitemap`, a
`robots.txt` pointing at it, and `/rss.xml`.

The OG image is the preview card shown when a link is pasted into LinkedIn, X, WhatsApp or Slack —
conventionally a 1200×630 PNG. The project has none, so shared links currently render as bare text. I will
generate a simple `public/og.png` matching the site's typography (name in Monsieur La Doulaise on black,
role beneath in Geist) and wire `og:image` to it. Replace it later with something designed if wanted; it is
not a blocker.

**8. Delete.** `src/app/` entirely — all ~50 `components/ui/*`, `components/figma/ImageWithFallback.tsx`,
and `App.tsx`. Plus `src/main.tsx`, `index.html`, `vite.config.ts`, `components.json`,
`default_shadcn_theme.css`, and `guidelines/`. I'll confirm `default_shadcn_theme.css` and `guidelines/` are
unreferenced before removing them.

**9. Update `README.md`** — it currently documents the React/Vite stack.

## Verification

- `pnpm build` clean, then `pnpm preview`.
- **View source** on `/blog/http-retry-engine/` — the full post text must be in the HTML, not injected by
  JS. This is the whole point of the migration; if the text isn't there, nothing else matters.
- Confirm `dist/` contains `index.html`, `blog/index.html`, four `blog/<slug>/index.html`, `sitemap-*.xml`,
  `robots.txt`, `rss.xml`.
- Grep `dist/` for `noindex` — expect zero hits.
- Side-by-side against the current `pnpm dev` on both themes: hero, skills, all four projects, featured
  deep-dive, reflections, blog list, and each post. Watch the markdown `.prose` styling and the three
  images in the retry-engine post most closely.
- Hover a nav link, a social icon, an API endpoint, a project Live/Source link, and a link inside a blog
  post — five different preview paths.
- Network tab on load: zero requests to `api.microlink.io` until first hover.
- Toggle theme, reload — it should persist, with no flash of the wrong theme.
- Visit `/#/blog/zubbee-scheduler` — should land on `/blog/zubbee-scheduler/`.
- Lighthouse SEO on `/` and one post.

## Follow-ups after this lands

1. Replace the four placeholder post dates with real ones.
2. Replace the generated `og.png` with a designed card, if wanted.
3. Register `zubbee.vercel.app` in Google Search Console and submit the sitemap — SEO work has no effect
   until Google recrawls, and the `noindex` removal in particular needs a recrawl to take hold.
