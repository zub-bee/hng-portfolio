import insightaProfilesApi from "./blog/insighta-profiles-api.md?raw";
import httpRetryEngine from "./blog/http-retry-engine.md?raw";
import skillbridgeApi from "./blog/skillbridge-api.md?raw";
import zubbeeScheduler from "./blog/zubbee-scheduler.md?raw";

export type BlogPost = {
  slug: string;
  title: string;
  projectName: string;
  summary: string;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "insighta-profiles-api",
    title: "How I Designed and Shipped Insighta Profiles API",
    projectName: "Insighta Profiles API, Web Portal & CLI Tool",
    summary:
      "Architecture decisions, OAuth + PKCE implementation details, and what changed after scaling the API design.",
    content: insightaProfilesApi,
  },
  {
    slug: "http-retry-engine",
    title: "Building a Retry Engine with Backoff, Jitter, and Dead Letters",
    projectName: "HTTP Retry Engine",
    summary:
      "Designing a robust retry loop, modeling attempt history, and handling failure states safely.",
    content: httpRetryEngine,
  },
  {
    slug: "skillbridge-api",
    title: "Fixing Real Production Pain in SkillBridge API",
    projectName: "SkillBridge API",
    summary:
      "From URL hallucination fixes to employer verification and assessment flow stability.",
    content: skillbridgeApi,
  },
  {
    slug: "zubbee-scheduler",
    title: "The Highlight of my HNG Experience",
    projectName: "Zubbee Scheduler & SkillBridge API",
    summary:
      "A technical blog post reflecting on two key internship milestones: building the custom Zubbee background job scheduler and resolving production issues in the collaborative SkillBridge API.",
    content: zubbeeScheduler,
  },
];
