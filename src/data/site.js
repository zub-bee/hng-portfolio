/**
 * Single source of truth for site-wide identity and SEO defaults.
 * Plain JS (not TS) because `astro.config.mjs` imports it for the `site` option.
 */
export const SITE = {
  url: "https://zubbee.vercel.app",
  name: "Deborah Anyachukwu",
  role: "Backend Engineer",
  email: "deborahanyachukwunz@gmail.com",
  location: "Enugu, Nigeria",
  title: "Deborah Anyachukwu | Backend Engineer",
  description:
    "Backend engineer in Enugu, Nigeria. I build profile management APIs with OAuth and NLP search, distributed retry engines, and NestJS talent platforms.",
  blogTitle: "Engineering Blog | Deborah Anyachukwu",
  blogDescription:
    "Notes from real backend builds: system design choices, mistakes, and what changed between first implementation and final solution.",
  ogImage: "/og.png",
  github: "https://github.com/zub-bee",
  githubHandle: "@zub-bee",
  linkedin: "https://www.linkedin.com/in/deborahanyachukwu",
  insightaBaseUrl: "https://insighta-web-portal.netlify.app",
};

export const FONTS = {
  mono: "'JetBrains Mono', 'Consolas', ui-monospace, monospace",
  script: "'Monsieur La Doulaise', cursive",
  sans: "'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif",
};
