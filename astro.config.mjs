// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";

import { SITE } from "./src/data/site.js";

/**
 * Walks a hast tree once, top-down. A node is visited exactly once, so
 * renaming a tag in place never causes it to be re-processed.
 *
 * @param {any} node
 * @param {(node: any, parent: any, index: number) => void} fn
 * @param {any} [parent]
 * @param {number} [index]
 */
function walk(node, fn, parent, index) {
  if (parent) fn(node, parent, /** @type {number} */ (index));
  const children = node.children;
  if (!Array.isArray(children)) return;
  // Iterate backwards so in-place replacement can't shift unvisited indices.
  for (let i = children.length - 1; i >= 0; i--) {
    walk(children[i], fn, node, i);
  }
}

/** Headings inside a post sit under the page's real <h1>, so shift them down one
 * level to keep the document outline valid. Mirrors the h1->h2 / h2->h3 / h3->h4
 * remapping the old React `BlogMarkdown` component did.
 *
 * @param {string} tagName
 * @returns {string | undefined}
 */
function shiftHeading(tagName) {
  const level = /^h([1-5])$/.exec(tagName);
  return level ? `h${Number(level[1]) + 1}` : undefined;
}

/**
 * Single-pass rehype plugin covering three concerns that used to live in the
 * `components` map of react-markdown:
 *   - shift heading levels down one
 *   - style links and opt them into the hover-preview script
 *   - wrap standalone images in a figure div so `overflow-hidden` can clip the
 *     hover scale (an <img> cannot clip its own transform)
 */
function decorateMarkdown() {
  return (/** @type {any} */ tree) => {
    walk(tree, (node, parent, index) => {
      if (node.type !== "element") return;

      const shifted = shiftHeading(node.tagName);
      if (shifted) node.tagName = shifted;

      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        node.properties = {
          ...node.properties,
          class: "prose-link",
          "data-preview": "",
        };
        if (/^https?:/i.test(href)) {
          node.properties.target = "_blank";
          node.properties.rel = "noopener noreferrer";
        }
      }

      if (node.tagName === "p") {
        const meaningful = node.children.filter(
          (/** @type {any} */ c) =>
            !(c.type === "text" && String(c.value).trim() === ""),
        );
        const only = meaningful.length === 1 ? meaningful[0] : null;
        if (only && only.type === "element" && only.tagName === "img") {
          parent.children[index] = {
            type: "element",
            tagName: "div",
            properties: { class: "prose-figure" },
            children: [only],
          };
        }
      }
    });
  };
}

export default defineConfig({
  site: SITE.url,
  trailingSlash: "ignore",
  integrations: [sitemap()],
  markdown: {
    // The previous react-markdown setup applied no syntax highlighting - code
    // blocks were plain mono text on a grey background. Keeping that. Switching
    // this to 'shiki' is a one-line upgrade if colour is ever wanted.
    syntaxHighlight: false,
    processor: satteri({
      hastPlugins: [decorateMarkdown],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
