/**
 * Client entry. Everything the site does interactively lives here or in
 * link-preview.ts - together they replace React, Radix and framer-motion.
 *
 * The initial theme class is NOT set here; a blocking inline script in
 * BaseLayout does that before first paint to avoid a flash of the wrong theme.
 */
import { initLinkPreviews } from './link-preview'

/** Theme toggle, including the circular View Transitions reveal. */
function initTheme() {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')
  if (!btn) return

  const apply = (dark: boolean) => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {
      // Private browsing with storage disabled - the toggle still works for
      // this page view, it just won't be remembered.
    }
  }

  btn.addEventListener('click', (e) => {
    const next = !document.documentElement.classList.contains('dark')
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const root = document.documentElement
    root.style.setProperty('--toggle-x', `${x}px`)
    root.style.setProperty('--toggle-y', `${y}px`)
    root.style.setProperty('--toggle-r', `${r}px`)

    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> }
      }
    ).startViewTransition?.bind(document)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (startViewTransition && !reduced) {
      root.classList.add('theme-toggle-circle')
      startViewTransition(() => apply(next)).finished.finally(() =>
        root.classList.remove('theme-toggle-circle'),
      )
    } else {
      apply(next)
    }
  })
}

/** Fades the fixed bottom gradient in over the last 30% of the page. */
function initScrollGradient() {
  const gradient = document.querySelector<HTMLElement>('[data-scroll-gradient]')
  if (!gradient) return

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const raw = max > 0 ? window.scrollY / max : 0
    const start = 0.7
    const p = Math.max(0, Math.min(1, (raw - start) / (1 - start)))
    gradient.style.opacity = String(p)
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
}

/** Copy-to-clipboard on the email button, with the 1.5s tick swap. */
function initCopyEmail() {
  const btn = document.querySelector<HTMLButtonElement>('[data-copy-email]')
  if (!btn) return

  let timer: number | undefined
  btn.addEventListener('click', async () => {
    const email = btn.dataset.copyEmail ?? ''
    try {
      await navigator.clipboard?.writeText(email)
    } catch {
      return
    }
    btn.dataset.copied = 'true'
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      delete btn.dataset.copied
    }, 1500)
  })
}

function initBackToTop() {
  const btn = document.querySelector<HTMLButtonElement>('[data-back-to-top]')
  btn?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }),
  )
}

initTheme()
initScrollGradient()
initCopyEmail()
initBackToTop()
initLinkPreviews()
