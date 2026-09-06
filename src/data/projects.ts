export type Project = {
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

export const projects: Project[] = [
  {
    name: "Medidoc EHR API",
    year: "Aug 2026",
    description:
      "Production-ready Electronic Health Records REST API serving patient apps, clinical dashboards, and provider portals, with full auth, records management, and platform administration.",
    stack: [
      "Node.js",
      "Express",
      "TypeScript",
      "PostgreSQL",
      "Drizzle ORM",
      "Redis",
    ],
    contribution:
      "Built the full system excluding appointments, invoices/payments, and consent forms: liveness and dependency health checks, complete auth system (registration, login, JWT sessions, token refresh/revocation, password management), GitHub and Google OAuth flows, patient profile retrieval and updates, care episodes with clinical entries and versioned medical summaries, org and practitioner access grant/revocation, organization and provider management (listings, admins, practitioners, availability, patient rosters), and platform administration (org verification/suspension, platform-wide stats, audit logs).",
    blogSlug: "medidoc-ehr-api",
    source: "https://github.com/zub-bee/Medidoc",
  },
  {
    name: "Event Registration & QR Check-In",
    year: "Jul 2026",
    description:
      "Full-stack event attendee system: registration form, capacity enforcement, emailed QR tickets, camera-based one-time QR scanning, and a live admin dashboard.",
    stack: ["Node.js", "Express", "SQLite", "html5-qrcode"],
    contribution:
      "Built the entire system: registration endpoint with 100-person capacity gate, unique random QR token generation, SMTP email delivery of QR tickets, staff JWT authentication, camera-based QR scanning that flips tokens from unused to used on first scan and rejects repeats, and an admin dashboard for live attendee tracking.",
    blogSlug: "event-registration",
    source: "https://github.com/zub-bee/event-registration",
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
    source: "https://github.com/project-skillbridge/credlane-be-",
    extraLinks: [
      {
        label: "Archived Repos",
        url: "https://github.com/hngprojects/skill-bridge-api",
      },
    ],
  },
  {
    name: "Insighta Profiles API, Web Portal & CLI Tool",
    year: "Apr 2026",
    description:
      "Full-stack profile management system with GitHub OAuth 2.0 + PKCE, natural language search, role-based access control, and a matching CLI tool.",
    stack: ["Node.js", "Express", "PostgreSQL", "Redis", "JWT"],
    contribution:
      "Architected and built the entire backend from scratch: designed the PostgreSQL schema for profiles and users, implemented GitHub OAuth 2.0 with PKCE (S256 challenge) for both web and CLI clients with HTTP-only cookie transport and Authorization header support respectively. Built role-based access control (admin/analyst separation), a rule-based NLP query parser that converts plain English like 'adult males from Kenya' into parameterised SQL by resolving country names via REST Countries API to ISO codes and mapping age keywords to numeric ranges. Added API versioning middleware (X-API-Version header enforcement), Redis-backed rate limiting (auth: 10/min, API: 60/min with IPv6 subnet grouping), token blacklisting on logout/refresh, transparent token auto-refresh for both web and CLI, admin CSV export, profile aggregation dashboard, and the full CLI tool with device-code auth flow. Integrated Genderize.io, Agify.io, and Nationalize.io for name classification.",
    blogSlug: "insighta-profiles-api",
    live: "https://insighta-web-portal.netlify.app/login.html",
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
];

/** Featured deep-dive on the Insighta project, shown on the home page. */
export const featuredEndpoints: [string, string][] = [
  ["POST /auth/github/cli/callback", "CLI OAuth exchange"],
  ["POST /auth/refresh", "Token rotation + blacklist"],
  ["GET /api/profiles/search", "Natural language query"],
  ["GET /api/profiles/dashboard", "Aggregated analytics"],
  ["GET /api/profiles/export", "Admin CSV export"],
];
