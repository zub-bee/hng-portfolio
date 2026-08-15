import {
  Github,
  Linkedin,
  Mail,
  Sun,
  Moon,
  Copy,
  ArrowUp,
  Check,
  ExternalLink,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { blogPosts } from "../content/blogPosts";
import { LinkPreview } from "./components/ui/link-preview";

const mono = "'JetBrains Mono', 'Consolas', ui-monospace, monospace";
const script = "'Monsieur La Doulaise', cursive";
const sans = "'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif";

type Project = {
  name: string;
  year: string;
  description: string;
  stack: string[];
  contribution: string;
  blogSlug: string;
  live?: string;
  source?: string;
  extraLinks?: { label: string; url: string }[];
};

const normalizeMarkdownImageUrl = (src?: string) => {
  if (!src) return src;
  if (
    src.startsWith("/") ||
    src.startsWith("http") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  return `/${src}`;
};

function BlogMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ href, title, children }) => {
          if (!href) return <>{children}</>;
          return (
            <LinkPreview
              url={href}
              title={title}
              className="text-rose-500 dark:text-rose-400 hover:opacity-80 underline transition-opacity inline"
            >
              {children}
            </LinkPreview>
          );
        },
        h1: ({ children }) => (
          <h2
            className="text-[30px] leading-[40px] pt-8"
            style={{ letterSpacing: "-0.8px", fontWeight: 500 }}
          >
            {children}
          </h2>
        ),
        h2: ({ children }) => (
          <h3
            className="text-[22px] leading-[32px] pt-10"
            style={{ letterSpacing: "-0.4px" }}
          >
            {children}
          </h3>
        ),
        h3: ({ children }) => (
          <h4 className="text-[18px] leading-[28px] pt-8">{children}</h4>
        ),
        p: ({ children }) => (
          <p
            className="opacity-75 text-[15px] leading-[26px] pt-5"
            style={{ fontWeight: 300 }}
          >
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="pt-4 pl-5 list-disc space-y-2 opacity-80">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="pt-4 pl-5 list-decimal space-y-2 opacity-80">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-[15px] leading-[25px]">{children}</li>
        ),
        hr: () => (
          <hr className="my-8 border-t border-black/10 dark:border-white/10" />
        ),
        pre: ({ children }) => (
          <pre
            className="mt-5 p-4 rounded overflow-x-auto"
            style={{
              fontFamily: mono,
              fontSize: "12px",
              backgroundColor: "rgba(127,127,127,0.12)",
            }}
          >
            {children}
          </pre>
        ),
        code: ({ inline, children, className }) => {
          if (inline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded opacity-90"
                style={{
                  fontFamily: mono,
                  fontSize: "12px",
                  backgroundColor: "rgba(127,127,127,0.15)",
                }}
              >
                {children}
              </code>
            );
          }

          return <code className={className}>{children}</code>;
        },
        img: ({ src, alt, title }) => {
          const safeSrc = normalizeMarkdownImageUrl(src);
          return safeSrc ? (
            <div className="mt-6 w-full rounded-xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 hover:shadow-xl transition-all duration-300 bg-black/5 dark:bg-white/5">
              <img
                src={safeSrc}
                alt={alt ?? ""}
                title={title}
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>
          ) : null;
        },
        iframe: ({ src, title }) => {
          const safeSrc = typeof src === "string" ? src : "";
          if (!safeSrc) return null;

          return (
            <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden shadow-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <iframe
                src={safeSrc}
                title={title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const projects: Project[] = [
  {
    name: "Insighta Profiles API, Web Portal & CLI Tool",
    year: "Apr 2026",
    description:
      "Full-stack profile management system with GitHub OAuth 2.0 + PKCE, natural language search, role-based access control, and a matching CLI tool.",
    stack: ["Node.js", "Express", "PostgreSQL", "Redis", "JWT"],
    contribution:
      "Architected and built the entire backend from scratch: designed the PostgreSQL schema for profiles and users, implemented GitHub OAuth 2.0 with PKCE (S256 challenge) for both web and CLI clients with HTTP-only cookie transport and Authorization header support respectively. Built role-based access control (admin/analyst separation), a rule-based NLP query parser that converts plain English like 'adult males from Kenya' into parameterised SQL by resolving country names via REST Countries API to ISO codes and mapping age keywords to numeric ranges. Added API versioning middleware (X-API-Version header enforcement), Redis-backed rate limiting (auth: 10/min, API: 60/min with IPv6 subnet grouping), token blacklisting on logout/refresh, transparent token auto-refresh for both web and CLI, admin CSV export, profile aggregation dashboard, and the full CLI tool with device-code auth flow. Integrated Genderize.io, Agify.io, and Nationalize.io for name classification.",
    blogSlug: "insighta-profiles-api",
    live: "https://ubiquitous-chainsaw-production-73a8.up.railway.app/",
    source: "https://github.com/zub-bee/ubiquitous-chainsaw",
    extraLinks: [
      {
        label: "Web Portal",
        url: "https://github.com/zub-bee/insighta-web-portal",
      },
      {
        label: "CLI Tool",
        url: "https://github.com/zub-bee/insighta-cli-tool",
      },
    ],
  },
  {
    name: "HTTP Retry Engine",
    year: "May 2026",
    description:
      "Background retry service that handles failed HTTP requests with exponential backoff, jitter, dead-letter queuing, and full attempt history.",
    stack: ["Node.js", "Express", "SQLite"],
    contribution:
      "Implemented the full system from a given spec: a 500ms-interval polling worker that queries SQLite for pending/retrying jobs whose nextRetryAt has elapsed, executes the HTTP request, and routes the result based on status code. 2xx marks completed, 4xx marks permanently failed (no retry), 5xx triggers exponential backoff (backoffMs * 2^attempt * jitter where jitter is 0.8-1.2 per attempt to prevent thundering herd). When attemptCount exceeds configurable maxRetries (default 5), the job moves to failed status as a dead-letter. Every attempt is recorded in a separate attempts table with status and message for full auditability. Built the REST API: POST /request for job submission with URL/method/body validation, GET /requests/:id with joined attempt history, and GET /requests?status= for filtering. All DB mutations use SQLite transactions for atomicity.",
    blogSlug: "http-retry-engine",
    source: "https://github.com/zub-bee/retry-engine",
  },
  {
    name: "SkillBridge API",
    year: "May 2026",
    description:
      "Backend for an AI-powered talent assessment and employer-candidate matching platform, built collaboratively during HNG Stage 8.",
    stack: ["NestJS", "TypeScript", "PostgreSQL", "TypeORM", "Swagger"],
    contribution:
      "Resolved AI-hallucinated broken resource URLs by building a UrlResolutionService that validates links via YouTube Data API v3 and Serper.dev Google Search, replacing fabricated URLs the LLM was generating. Built the full employer verification and trust layer: schema design, SSRF-hardened website reachability checks, LinkedIn validation, verification gates blocking unverified employers from sending offers or contacting candidates, hire-complete flow, and public employer profiles. Fixed skill assessment retake blocking, corrected question count mismatches across skill and advanced assessments, added configurable timeouts to all AI calls with background cache warming, served general learning resources pre-assessment, standardized all API responses to snake_case, and converted skill assessments to MCQ-only scoring. 23+ merged PRs total.",
    blogSlug: "skillbridge-api",
    source: "https://github.com/hngprojects/skill-bridge-api",
  },
  {
    name: "Zubbee Scheduler",
    year: "Jun 2026",
    description:
      "A background job scheduler with priority queuing, retries, dead-letter handling, and a live React dashboard for the Dilamme R&D Stage 9 challenge.",
    stack: ["Node.js", "SQLite", "React", "Vite"],
    contribution:
      "Built a scheduler that creates, queues, processes, and tracks jobs while workers run independently in the background. Added retry handling with a maximum of 3 attempts, dead-letter queue recovery, priority ordering, cancellation handling, DAG workflow support, starvation prevention, and a live React dashboard to inspect queue state.",
    blogSlug: "zubbee-scheduler",
    live: "https://zubbee-scheduler-fe.vercel.app",
    source: "https://github.com/zub-bee/zubbee-scheduler",
  },
];

type AppView = "home" | "blog";

const getViewFromHash = (): { view: AppView; slug?: string } => {
  const hash = window.location.hash || "#/";
  if (hash.startsWith("#/blog")) {
    const parts = hash.split("/");
    const slug =
      parts.length >= 3 ? decodeURIComponent(parts[2] || "") : undefined;
    return { view: "blog", slug };
  }
  return { view: "home" };
};

const skills = [
  { name: "REST API Design", project: "Insighta" },
  { name: "System Design & Architecture", project: "Insighta, SkillBridge" },
  { name: "GitHub OAuth 2.0 + PKCE", project: "Insighta" },
  { name: "JWT Auth & Token Blacklisting", project: "Insighta, SkillBridge" },
  { name: "PostgreSQL & Schema Design", project: "Insighta, SkillBridge" },
  { name: "Redis (sessions, blacklist)", project: "Insighta" },
  { name: "External API Integration", project: "SkillBridge" },
  { name: "Background Jobs & Workers", project: "Retry Engine" },
  { name: "Exponential Backoff & Jitter", project: "Retry Engine" },
  { name: "NestJS + TypeScript", project: "SkillBridge" },
  { name: "Unit Testing", project: "SkillBridge" },
  { name: "Deployment (Railway)", project: "Insighta" },
  { name: "CLI Development", project: "Insighta CLI" },
];

const reflections = [
  {
    title: "Design the system before writing the code",
    body: "Early in HNG I'd jump straight to implementation. By the third iteration of the Insighta Profiles API I had the schema, request flow, caching strategy, and rate limiting designed upfront. That shift made the code cleaner and debugging far less painful.",
  },
  {
    title: "System design and implementation go hand in hand",
    body: "Before Insighta I would jump straight to code. Building the Profiles API for 2 million users forced me to think about schema design, request flow, caching strategy, and rate limiting before writing a single route. That upfront design work made the implementation faster and the system far more maintainable. I now treat architecture as part of the build, not a separate step.",
  },
  {
    title: "Backoff and jitter are not optional in distributed systems",
    body: "Building the retry engine made me understand thundering herd problems in practice. Doubling the delay per retry is obvious, but rolling fresh jitter per attempt, not once, is the subtlety I would have missed without working through it hands-on.",
  },
  {
    title: "Auth is the part you cannot get wrong",
    body: "Implementing GitHub OAuth with PKCE, HTTP-only cookies, Redis token blacklisting, and auto-refresh across both a web portal and a CLI taught me how many failure modes auth has. I think about session security very differently now.",
  },
  {
    title: "Working in a collaborative codebase teaches you discipline",
    body: "Contributing 30+ PRs to SkillBridge with other developers taught me how to write code that others can review and maintain: consistent naming conventions, clear PR descriptions, proper test coverage, and thinking about how my changes affect the rest of the system. I also learnt the importance of API contracts and how creating them enforces good API design practices and conventions.",
  },
];

function SocialIcon({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  const isGithub = href.includes("github.com");
  const isLinkedin = href.includes("linkedin.com");
  const isEmail = href.startsWith("mailto:");

  const preview = (() => {
    if (isGithub) {
      return (
        <div className="flex flex-col gap-2 p-1 text-left">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
            <Github size={18} />
            <span className="font-semibold text-[13px] tracking-tight">
              GitHub Profile
            </span>
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="text-[12px] font-medium text-black dark:text-white">
              @zub-bee
            </span>
            <span className="text-[11px] opacity-70 leading-snug pt-1">
              Explore repositories, contributions, system architecture design
              examples, and other project codebases.
            </span>
          </div>
        </div>
      );
    }
    if (isLinkedin) {
      return (
        <div className="flex flex-col gap-2 p-1 text-left">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
            <Linkedin size={18} />
            <span className="font-semibold text-[13px] tracking-tight">
              LinkedIn Profile
            </span>
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="text-[12px] font-medium text-black dark:text-white">
              Deborah Anyachukwu
            </span>
            <span className="text-[11px] opacity-70 leading-snug pt-1">
              Connect on LinkedIn. Open to discussions, roles, and professional
              opportunities in backend engineering.
            </span>
          </div>
        </div>
      );
    }
    if (isEmail) {
      return (
        <div className="flex flex-col gap-2 p-1 text-left">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
            <Mail size={18} />
            <span className="font-semibold text-[13px] tracking-tight">
              Email Direct
            </span>
          </div>
          <div className="flex flex-col pt-0.5">
            <span
              className="text-[12px] font-medium text-black dark:text-white"
              style={{ wordBreak: "break-all" }}
            >
              deborahanyachukwunz@gmail.com
            </span>
            <span className="text-[11px] opacity-70 leading-snug pt-1">
              Send a direct inquiry for roles, backend system design consulting,
              and engineering collaborations.
            </span>
          </div>
        </div>
      );
    }
    return undefined;
  })();

  return (
    <LinkPreview
      url={href}
      aria-label={label}
      className="opacity-40 hover:opacity-100 transition-opacity duration-200"
      previewContent={preview}
    >
      {children}
    </LinkPreview>
  );
}

export default function App() {
  const initialRoute = getViewFromHash();
  const [view, setView] = useState<AppView>(initialRoute.view);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | undefined>(
    initialRoute.slug,
  );
  const [dark, setDark] = useState(true);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const email = "deborahanyachukwunz@gmail.com";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const syncHashRoute = () => {
      const route = getViewFromHash();
      setView(route.view);
      setActiveBlogSlug(route.slug);
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    syncHashRoute();
    window.addEventListener("hashchange", syncHashRoute);
    return () => window.removeEventListener("hashchange", syncHashRoute);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const raw = max > 0 ? window.scrollY / max : 0;
      const start = 0.7;
      const p = Math.max(0, Math.min(1, (raw - start) / (1 - start)));
      setScrollProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const selectedPost = blogPosts.find((post) => post.slug === activeBlogSlug);

  const bg = dark ? "bg-black text-white" : "bg-white text-black";
  const border = dark ? "border-white/10" : "border-black/10";
  const borderStrong = dark ? "border-white" : "border-black";

  return (
    <div
      className={`relative min-h-screen w-full ${bg} transition-colors duration-300`}
      style={{ fontFamily: sans }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-[70vh] z-0 transition-opacity duration-300"
        style={{
          opacity: scrollProgress,
          background: dark
            ? "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(120,20,55,0.85) 0%, rgba(80,10,40,0.55) 30%, rgba(40,5,20,0.25) 60%, rgba(0,0,0,0) 100%)"
            : "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(255,200,215,0.7) 0%, rgba(255,220,225,0.4) 40%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[640px] px-6 sm:px-8">
        {/* HERO */}
        <section className="pt-28 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1
                style={{ fontFamily: script, letterSpacing: "-1.2px" }}
                className="text-[48px] leading-[48px]"
              >
                Deborah Anyachukwu
              </h1>
              <div className="mt-5 flex items-center gap-5">
                <LinkPreview
                  url="#/"
                  className={`text-[10px] uppercase transition-opacity ${view === "home" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                  style={{ letterSpacing: "1px", fontFamily: mono }}
                  previewContent={
                    <div className="flex flex-col gap-1 p-1 text-left">
                      <span
                        className="text-[9px] uppercase opacity-50 tracking-wider"
                        style={{ fontFamily: mono }}
                      >
                        Navigation
                      </span>
                      <h4 className="text-[13px] font-semibold leading-tight pt-0.5">
                        Portfolio Home
                      </h4>
                      <p className="text-[11px] opacity-70 leading-snug pt-1">
                        View Deborah's engineering background, core backend
                        skills, selected HNG projects, and detailed system
                        designs.
                      </p>
                    </div>
                  }
                >
                  Portfolio
                </LinkPreview>
                <LinkPreview
                  url="#/blog"
                  className={`text-[10px] uppercase transition-opacity flex items-center gap-1.5 ${view === "blog" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                  style={{ letterSpacing: "1px", fontFamily: mono }}
                  previewContent={
                    <div className="flex flex-col gap-1 p-1 text-left">
                      <span
                        className="text-[9px] uppercase opacity-50 tracking-wider"
                        style={{ fontFamily: mono }}
                      >
                        Navigation
                      </span>
                      <h4 className="text-[13px] font-semibold leading-tight pt-0.5">
                        Engineering Blog
                      </h4>
                      <p className="text-[11px] opacity-70 leading-snug pt-1">
                        Read deep-dives on the retry engine architecture, NestJS
                        API fixes, and building a custom task scheduler.
                      </p>
                    </div>
                  }
                >
                  Blog <BookOpen size={11} />
                </LinkPreview>
              </div>
            </div>
            <button
              onClick={(e) => {
                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const r = Math.hypot(
                  Math.max(x, window.innerWidth - x),
                  Math.max(y, window.innerHeight - y),
                );
                const root = document.documentElement;
                root.style.setProperty("--toggle-x", `${x}px`);
                root.style.setProperty("--toggle-y", `${y}px`);
                root.style.setProperty("--toggle-r", `${r}px`);
                // @ts-ignore
                if (document.startViewTransition) {
                  root.classList.add("theme-toggle-circle");
                  // @ts-ignore
                  const t = document.startViewTransition(() =>
                    setDark((d) => !d),
                  );
                  t.finished.finally(() =>
                    root.classList.remove("theme-toggle-circle"),
                  );
                } else {
                  setDark((d) => !d);
                }
              }}
              aria-label="Toggle theme"
              className="opacity-40 hover:opacity-100 transition-opacity duration-200 p-1"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {view === "home" ? (
            <p
              className="opacity-60 mt-6 text-[17px] leading-[27.625px]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            >
              Backend engineer based in Enugu, Nigeria. Over the past months at
              HNG and beyond, I shipped a profile management API with GitHub OAuth and NLP
              search, a distributed retry engine, and contributed to
              SkillBridge, a talent assessment platform built in NestJS. I care
              about systems that are honest, operable, and built to last.
            </p>
          ) : (
            <p
              className="opacity-60 mt-6 text-[17px] leading-[27.625px]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            >
              Notes from real backend builds: system design choices, mistakes,
              and what changed between first implementation and final solution.
            </p>
          )}

          <div className="flex gap-6 items-center pt-8">
            <SocialIcon href="https://github.com/zub-bee" label="GitHub">
              <Github size={16} />
            </SocialIcon>
            <SocialIcon
              href="https://www.linkedin.com/in/deborahanyachukwu"
              label="LinkedIn"
            >
              <Linkedin size={16} />
            </SocialIcon>
            <SocialIcon href={`mailto:${email}`} label="Email">
              <Mail size={16} />
            </SocialIcon>
          </div>
        </section>

        {view === "home" && (
          <>
            {/* SKILLS */}
            <section className={`border-t ${border} pt-8 pb-12`}>
              <h2
                className="text-[24px] leading-[32px]"
                style={{ fontWeight: 500, letterSpacing: "-0.6px" }}
              >
                Backend Skills
              </h2>
              <div className="pt-8 flex flex-col gap-4">
                {skills.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-start justify-between gap-4"
                  >
                    <h3
                      className="text-[14px] leading-[20px]"
                      style={{ fontWeight: 500 }}
                    >
                      {s.name}
                    </h3>
                    <span
                      className="opacity-40 text-[11px] leading-[16px] whitespace-nowrap pt-0.5"
                      style={{ fontFamily: mono, letterSpacing: "0.5px" }}
                    >
                      {s.project}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* PROJECTS */}
            <section className={`border-t ${border} pt-12 pb-12`}>
              <h2
                className="text-[24px] leading-[32px]"
                style={{ fontWeight: 500, letterSpacing: "-0.6px" }}
              >
                Projects
              </h2>
              <div className="pt-10 flex flex-col gap-12">
                {projects.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-start justify-between">
                      <h3
                        className="text-[18px] leading-[28px]"
                        style={{ fontWeight: 500 }}
                      >
                        {p.name}
                      </h3>
                      <span
                        className="opacity-40 text-[12px] leading-[16px] pt-2"
                        style={{ fontFamily: mono }}
                      >
                        {p.year}
                      </span>
                    </div>
                    <p
                      className="opacity-60 text-[14px] leading-[22.75px] pt-2"
                      style={{ fontWeight: 300 }}
                    >
                      {p.description}
                    </p>
                    <p
                      className="opacity-50 text-[13px] leading-[20px] pt-3"
                      style={{ fontFamily: mono, letterSpacing: "0.3px" }}
                    >
                      {p.stack.join(" · ")}
                    </p>
                    <p
                      className="opacity-70 text-[13px] leading-[21px] pt-3"
                      style={{ fontWeight: 300 }}
                    >
                      <span
                        className="opacity-50 uppercase text-[10px]"
                        style={{ letterSpacing: "1px", fontFamily: mono }}
                      >
                        My work:{" "}
                      </span>
                      {p.contribution}
                    </p>
                    <div className="flex gap-6 items-center pt-4">
                      {p.live && (
                        <LinkPreview
                          url={p.live}
                          className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] uppercase"
                        >
                          Live <ExternalLink size={10} />
                        </LinkPreview>
                      )}
                      {p.source && (
                        <LinkPreview
                          url={p.source}
                          className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] uppercase"
                        >
                          Source <ExternalLink size={10} />
                        </LinkPreview>
                      )}
                      {p.extraLinks?.map((link) => (
                        <LinkPreview
                          key={link.label}
                          url={link.url}
                          className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] uppercase"
                        >
                          {link.label} <ExternalLink size={10} />
                        </LinkPreview>
                      ))}
                      <LinkPreview
                        url={`#/blog/${encodeURIComponent(p.blogSlug)}`}
                        className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] uppercase"
                        previewContent={(() => {
                          const post = blogPosts.find(
                            (post) => post.slug === p.blogSlug,
                          );
                          return (
                            <div className="flex flex-col gap-1 text-left">
                              <span
                                className="text-[9px] uppercase opacity-50 tracking-wider"
                                style={{ fontFamily: mono }}
                              >
                                {post?.projectName}
                              </span>
                              <h4 className="text-[13px] font-semibold leading-tight pt-0.5">
                                {post?.title}
                              </h4>
                              <p className="text-[11px] opacity-70 leading-snug pt-1">
                                {post?.summary}
                              </p>
                            </div>
                          );
                        })()}
                      >
                        Blog <BookOpen size={10} />
                      </LinkPreview>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED PROJECT */}
            <section className={`border-t ${border} pt-12 pb-12`}>
              <h2
                className="text-[24px] leading-[32px]"
                style={{ fontWeight: 500, letterSpacing: "-0.6px" }}
              >
                Featured Project
              </h2>
              <p
                className="opacity-50 text-[12px] uppercase pt-1"
                style={{ fontFamily: mono, letterSpacing: "1px" }}
              >
                Insighta Deep Dive
              </p>

              <div className="pt-8 flex flex-col gap-8">
                <div>
                  <h3
                    className="text-[13px] uppercase opacity-50"
                    style={{ fontFamily: mono, letterSpacing: "1px" }}
                  >
                    The Problem
                  </h3>
                  <p
                    className="opacity-70 text-[14px] leading-[22px] pt-3"
                    style={{ fontWeight: 300 }}
                  >
                    Managing a growing set of user profiles sourced from
                    external data providers (Genderize, Agify, Nationalize, REST
                    Countries) and making them searchable without forcing users
                    into rigid query syntax.
                  </p>
                </div>

                <div>
                  <h3
                    className="text-[13px] uppercase opacity-50"
                    style={{ fontFamily: mono, letterSpacing: "1px" }}
                  >
                    Architecture
                  </h3>
                  <p
                    className="opacity-70 text-[14px] leading-[22px] pt-3"
                    style={{ fontWeight: 300 }}
                  >
                    Express.js → PostgreSQL + Redis → External APIs. Clients
                    (Web Portal + CLI) pass through CORS, JWT auth, and API
                    versioning middleware before hitting routes. Redis handles
                    sessions and token blacklisting. PostgreSQL stores profiles,
                    users, and attempt history.
                  </p>
                </div>

                <div>
                  <h3
                    className="text-[13px] uppercase opacity-50"
                    style={{ fontFamily: mono, letterSpacing: "1px" }}
                  >
                    Key Endpoints
                  </h3>
                  <div className="pt-3 flex flex-col gap-2">
                    {[
                      ["POST /auth/github/cli/callback", "CLI OAuth exchange"],
                      ["POST /auth/refresh", "Token rotation + blacklist"],
                      ["GET /api/profiles/search", "Natural language query"],
                      ["GET /api/profiles/dashboard", "Aggregated analytics"],
                      ["GET /api/profiles/export", "Admin CSV export"],
                    ].map(([endpoint, label]) => {
                      const path = endpoint.split(" ")[1];
                      const href = `https://ubiquitous-chainsaw-production-73a8.up.railway.app${path}`;
                      return (
                        <div
                          key={endpoint}
                          className="flex items-start justify-between gap-4"
                        >
                          <LinkPreview
                            url={href}
                            className="text-[12px] hover:opacity-100 transition-opacity"
                            style={{ fontFamily: mono, opacity: 0.7 }}
                            previewContent={(() => {
                              const [method, routePath] = endpoint.split(" ");
                              const isPost = method === "POST";
                              const badgeColor = isPost
                                ? "bg-amber-500/15 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400 border-emerald-500/20";
                              return (
                                <div className="flex flex-col gap-1.5 p-1 text-left">
                                  <span
                                    className="text-[9px] uppercase opacity-50 tracking-wider"
                                    style={{ fontFamily: mono }}
                                  >
                                    API Endpoint
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}
                                      style={{ fontFamily: mono }}
                                    >
                                      {method}
                                    </span>
                                    <span
                                      className="text-[12px] font-medium text-black dark:text-white"
                                      style={{ fontFamily: mono }}
                                    >
                                      {routePath}
                                    </span>
                                  </div>
                                  <p className="text-[11px] opacity-70 leading-snug pt-0.5">
                                    {label}. Click to visit live deployment or
                                    query path directly.
                                  </p>
                                </div>
                              );
                            })()}
                          >
                            {endpoint}
                          </LinkPreview>
                          <span
                            className="opacity-40 text-[11px] whitespace-nowrap pt-0.5"
                            style={{ fontWeight: 300 }}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3
                    className="text-[13px] uppercase opacity-50"
                    style={{ fontFamily: mono, letterSpacing: "1px" }}
                  >
                    Challenge Solved
                  </h3>
                  <p
                    className="opacity-70 text-[14px] leading-[22px] pt-3"
                    style={{ fontWeight: 300 }}
                  >
                    Natural language search without AI. I built a rule-based
                    parser that maps plain-text phrases like{" "}
                    <span
                      className="opacity-100"
                      style={{ fontFamily: mono, fontSize: "12px" }}
                    >
                      "female adults from Nigeria under 30"
                    </span>{" "}
                    to parameterised SQL conditions, resolving country names
                    through the REST Countries API to ISO 3166 codes, and
                    mapping age keywords to numeric ranges. No LLMs, no external
                    NLP service.
                  </p>
                </div>
              </div>
            </section>

            {/* LEARNING REFLECTION */}
            <section className={`border-t ${border} pt-12 pb-12`}>
              <h2
                className="text-[24px] leading-[32px]"
                style={{ fontWeight: 500, letterSpacing: "-0.6px" }}
              >
                Learning Reflection
              </h2>
              <div className="pt-10 flex flex-col gap-8">
                {reflections.map((r) => (
                  <div key={r.title}>
                    <h3
                      className="text-[16px] leading-[24px]"
                      style={{ fontWeight: 500 }}
                    >
                      {r.title}
                    </h3>
                    <p
                      className="opacity-60 text-[14px] leading-[22.75px] pt-2"
                      style={{ fontWeight: 300 }}
                    >
                      {r.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === "blog" && (
          <section className={`border-t ${border} pt-12 pb-12`}>
            {!selectedPost ? (
              <>
                <h2
                  className="text-[24px] leading-[32px]"
                  style={{ fontWeight: 500, letterSpacing: "-0.6px" }}
                >
                  Blog
                </h2>
                <p
                  className="opacity-50 text-[12px] uppercase pt-1"
                  style={{ fontFamily: mono, letterSpacing: "1px" }}
                >
                  Engineering Writeups
                </p>

                <div className="pt-10 flex flex-col gap-8">
                  {blogPosts.map((post) => (
                    <article key={post.slug} className={`border ${border} p-5`}>
                      <h3
                        className="text-[18px] leading-[28px]"
                        style={{ fontWeight: 500 }}
                      >
                        {post.title}
                      </h3>
                      <p
                        className="opacity-50 text-[11px] uppercase pt-2"
                        style={{ fontFamily: mono, letterSpacing: "1px" }}
                      >
                        {post.projectName}
                      </p>
                      <p
                        className="opacity-70 text-[14px] leading-[22px] pt-3"
                        style={{ fontWeight: 300 }}
                      >
                        {post.summary}
                      </p>
                      <div className="pt-4 flex items-center justify-between">
                        <LinkPreview
                          url={`#/blog/${encodeURIComponent(post.slug)}`}
                          className="opacity-60 hover:opacity-100 transition-opacity text-[10px] uppercase flex items-center gap-1.5"
                          style={{ letterSpacing: "1px" }}
                          previewContent={
                            <div className="flex flex-col gap-1 text-left">
                              <span
                                className="text-[9px] uppercase opacity-50 tracking-wider"
                                style={{ fontFamily: mono }}
                              >
                                {post.projectName}
                              </span>
                              <h4 className="text-[13px] font-semibold leading-tight pt-0.5">
                                {post.title}
                              </h4>
                              <p className="text-[11px] opacity-70 leading-snug pt-1">
                                {post.summary}
                              </p>
                            </div>
                          }
                        >
                          Open writeup <ExternalLink size={10} />
                        </LinkPreview>
                        <span
                          className="opacity-40 text-[10px] uppercase"
                          style={{ letterSpacing: "1px", fontFamily: mono }}
                        >
                          June 2026
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <article>
                <LinkPreview
                  url="#/blog"
                  className="opacity-40 hover:opacity-100 transition-opacity text-[10px] uppercase inline-flex items-center gap-1.5"
                  style={{ letterSpacing: "1px" }}
                  previewContent={
                    <div className="flex flex-col gap-1 p-1 text-left">
                      <span
                        className="text-[9px] uppercase opacity-50 tracking-wider"
                        style={{ fontFamily: mono }}
                      >
                        Navigation
                      </span>
                      <h4 className="text-[13px] font-semibold leading-tight pt-0.5">
                        Back to Blog
                      </h4>
                      <p className="text-[11px] opacity-70 leading-snug pt-1">
                        Return to the list of engineering writeups detailing
                        backend builds and system designs.
                      </p>
                    </div>
                  }
                >
                  <ArrowLeft size={10} /> Back to all posts
                </LinkPreview>
                <h2
                  className="text-[28px] leading-[38px] pt-6"
                  style={{ fontWeight: 500, letterSpacing: "-0.8px" }}
                >
                  {selectedPost.title}
                </h2>
                <p
                  className="opacity-50 text-[12px] uppercase pt-2"
                  style={{ fontFamily: mono, letterSpacing: "1px" }}
                >
                  {selectedPost.projectName}
                </p>
                <p
                  className="opacity-50 text-[11px] uppercase pt-5"
                  style={{ fontFamily: mono, letterSpacing: "1px" }}
                >
                  Written by Zubbee™
                </p>
                <div className="pt-2">
                  <BlogMarkdown content={selectedPost.content} />
                </div>
              </article>
            )}
          </section>
        )}

        {/* CONTACT */}
        <section className="pt-20 pb-10">
          <div className="flex flex-col items-center">
            <h2
              className="text-[60px] leading-[60px] text-center bg-clip-text text-transparent"
              style={{
                fontWeight: 500,
                letterSpacing: "-3px",
                backgroundImage: dark
                  ? "linear-gradient(to bottom, rgba(255,255,255,0.4), #ffffff)"
                  : "linear-gradient(to bottom, rgba(0,0,0,0.4), #000000)",
              }}
            >
              Let's build.
            </h2>
            <p
              className="text-[18px] leading-[28px] text-center pt-4 max-w-[384px]"
              style={{ fontWeight: 300 }}
            >
              Open to backend engineering roles and collaborations. Enugu,
              Nigeria · UTC+1.
            </p>
            <button
              onClick={handleCopy}
              className={`mt-12 flex items-center gap-4 pb-2.5 border-b-2 ${borderStrong} w-full max-w-[404px] justify-center`}
            >
              <span
                className="text-[24px] leading-[32px] text-center"
                style={{ fontWeight: 500 }}
              >
                {email}
              </span>
              {copied ? (
                <Check size={20} />
              ) : (
                <Copy size={20} className="opacity-40" />
              )}
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className={`border-t ${border} pt-10 pb-10 flex items-center justify-between`}
        >
          <p
            className="text-[10px] uppercase leading-[15px]"
            style={{ fontWeight: 500, letterSpacing: "1px" }}
          >
            © 2026 Deborah Anyachukwu.
            <br />
            All Rights Reserved.
          </p>
          <button onClick={scrollTop} className="flex gap-3 items-center group">
            <span
              className="text-[10px] uppercase"
              style={{ fontWeight: 500, letterSpacing: "1px" }}
            >
              Back to Top
            </span>
            <span
              className={`rounded-full size-7 border ${borderStrong} flex items-center justify-center group-hover:-translate-y-0.5 transition-transform`}
            >
              <ArrowUp size={14} />
            </span>
          </button>
        </footer>
      </div>
      <Analytics />
    </div>
  );
}
