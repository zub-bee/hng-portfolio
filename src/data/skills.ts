export const skills: { name: string; project: string }[] = [
  { name: 'REST API Design', project: 'Insighta' },
  { name: 'System Design & Architecture', project: 'Insighta, SkillBridge' },
  { name: 'GitHub OAuth 2.0 + PKCE', project: 'Insighta' },
  { name: 'JWT Auth & Token Blacklisting', project: 'Insighta, SkillBridge' },
  { name: 'PostgreSQL & Schema Design', project: 'Insighta, SkillBridge' },
  { name: 'Redis (sessions, blacklist)', project: 'Insighta' },
  { name: 'External API Integration', project: 'SkillBridge' },
  { name: 'Background Jobs & Workers', project: 'Retry Engine' },
  { name: 'Exponential Backoff & Jitter', project: 'Retry Engine' },
  { name: 'NestJS + TypeScript', project: 'SkillBridge' },
  { name: 'Unit Testing', project: 'SkillBridge' },
  { name: 'Deployment (Railway)', project: 'Insighta' },
  { name: 'CLI Development', project: 'Insighta CLI' },
]

export const reflections: { title: string; body: string }[] = [
  {
    title: 'Design the system before writing the code',
    body: "Early in HNG I'd jump straight to implementation. By the third iteration of the Insighta Profiles API I had the schema, request flow, caching strategy, and rate limiting designed upfront. That shift made the code cleaner and debugging far less painful.",
  },
  {
    title: 'System design and implementation go hand in hand',
    body: 'Before Insighta I would jump straight to code. Building the Profiles API for 2 million users forced me to think about schema design, request flow, caching strategy, and rate limiting before writing a single route. That upfront design work made the implementation faster and the system far more maintainable. I now treat architecture as part of the build, not a separate step.',
  },
  {
    title: 'Backoff and jitter are not optional in distributed systems',
    body: 'Building the retry engine made me understand thundering herd problems in practice. Doubling the delay per retry is obvious, but rolling fresh jitter per attempt, not once, is the subtlety I would have missed without working through it hands-on.',
  },
  {
    title: 'Auth is the part you cannot get wrong',
    body: 'Implementing GitHub OAuth with PKCE, HTTP-only cookies, Redis token blacklisting, and auto-refresh across both a web portal and a CLI taught me how many failure modes auth has. I think about session security very differently now.',
  },
  {
    title: 'Working in a collaborative codebase teaches you discipline',
    body: 'Contributing 30+ PRs to SkillBridge with other developers taught me how to write code that others can review and maintain: consistent naming conventions, clear PR descriptions, proper test coverage, and thinking about how my changes affect the rest of the system. I also learnt the importance of API contracts and how creating them enforces good API design practices and conventions.',
  },
]
