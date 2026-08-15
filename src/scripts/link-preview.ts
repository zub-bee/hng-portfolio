/**
 * Hover previews for links.
 *
 * Replaces the per-link Radix HoverCard + framer-motion React component with one
 * shared popover and a delegated listener, so the page ships no framework.
 *
 * Three kinds of link, set by LinkPreview.astro via `data-preview-kind`:
 *   card  - clones the inert <template> the component rendered server-side
 *   image - microlink screenshot, fetched on first hover only
 *   text  - plain "Navigate to <url>" fallback for internal links
 *
 * The old component preloaded a screenshot for every external link on mount,
 * including the ten that rendered a custom card and never showed the image -
 * roughly fifteen wasted requests per page load. Nothing is fetched here until
 * a link is actually hovered.
 */

const OPEN_DELAY = 50;
const CLOSE_DELAY = 100;
const GAP = 10;
const SHOT_W = 200;
const SHOT_H = 125;

export function initLinkPreviews() {
  // Touch and keyboard-only devices never trigger hover cards; skip entirely.
  if (!window.matchMedia("(hover: hover)").matches) return;

  const card = document.createElement("div");
  card.id = "link-preview";
  card.setAttribute("role", "presentation");
  card.setAttribute("aria-hidden", "true");
  document.body.appendChild(card);

  let active: HTMLAnchorElement | null = null;
  let openTimer: number | undefined;
  let closeTimer: number | undefined;
  const shotCache = new Map<string, string>();

  const screenshotUrl = (url: string) => {
    const cached = shotCache.get(url);
    if (cached) return cached;

    const params = new URLSearchParams({
      url,
      screenshot: "true",
      meta: "false",
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": "true",
      "viewport.deviceScaleFactor": "1",
      "viewport.width": "600",
      "viewport.height": "375",
    });

    const built = `https://api.microlink.io/?${params}`;
    shotCache.set(url, built);
    return built;
  };

  const fill = (link: HTMLAnchorElement) => {
    // Links inside markdown are tagged by the rehype plugin in astro.config.mjs
    // and carry no explicit kind, so infer one from the href.
    const kind =
      link.dataset.previewKind ??
      (/^https?:/i.test(link.getAttribute("href") ?? "") ? "image" : "text");
    card.replaceChildren();

    if (kind === "card") {
      const tpl = link.querySelector<HTMLTemplateElement>(
        "template[data-preview-card]",
      );
      if (!tpl) return false;
      card.dataset.variant = "card";
      card.appendChild(tpl.content.cloneNode(true));
      return true;
    }

    if (kind === "image") {
      card.dataset.variant = "image";
      const img = document.createElement("img");
      img.src = screenshotUrl(link.href);
      img.width = SHOT_W;
      img.height = SHOT_H;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      card.appendChild(img);
      return true;
    }

    card.dataset.variant = "text";
    const p = document.createElement("p");
    p.className = "text-[12px] opacity-75";
    p.textContent = `Navigate to ${link.getAttribute("href") ?? ""}`;
    card.appendChild(p);
    return true;
  };

  /** Places the card above the link, centred, nudged toward the cursor. */
  const place = (link: HTMLAnchorElement, clientX?: number) => {
    const rect = link.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;

    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = rect.top - h - GAP;
    // Flip below the link if there isn't room above.
    if (top < 8) top = rect.bottom + GAP;

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;

    if (clientX !== undefined) {
      // Same easing the framer-motion spring gave: half the cursor's offset
      // from the link's centre. Smoothed by the CSS transition on transform.
      const dx = (clientX - rect.left - rect.width / 2) / 2;
      card.style.setProperty("--dx", `${dx}px`);
    }
  };

  const open = (link: HTMLAnchorElement, clientX?: number) => {
    if (!fill(link)) return;
    active = link;
    // Measure with the card laid out but still invisible.
    card.dataset.open = "false";
    place(link, clientX);
    requestAnimationFrame(() => {
      if (active !== link) return;
      card.dataset.open = "true";
    });
  };

  const close = () => {
    active = null;
    card.dataset.open = "false";
  };

  const scheduleOpen = (link: HTMLAnchorElement, clientX?: number) => {
    window.clearTimeout(closeTimer);
    window.clearTimeout(openTimer);
    openTimer = window.setTimeout(() => open(link, clientX), OPEN_DELAY);
  };

  const scheduleClose = () => {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(close, CLOSE_DELAY);
  };

  const linkFrom = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLAnchorElement>("a[data-preview]")
      : null;

  document
    .querySelectorAll<HTMLAnchorElement>("a[data-preview]")
    .forEach((link) => {
      link.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        if (link === active) return;
        scheduleOpen(link, e.clientX);
      });

      link.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        if (linkFrom(e.relatedTarget) === link) return;
        scheduleClose();
      });
    });

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !active) return;
    if (linkFrom(e.target) !== active) return;
    place(active, e.clientX);
  });

  document.addEventListener("focusin", (e) => {
    const link = linkFrom(e.target);
    if (link) scheduleOpen(link);
  });

  document.addEventListener("focusout", (e) => {
    if (linkFrom(e.target)) scheduleClose();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && active) close();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (active) close();
    },
    { passive: true },
  );
}
