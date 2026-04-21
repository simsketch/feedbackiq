export type CellValue = boolean | string;

export interface ComparisonRow {
  feature: string;
  us: CellValue;
  them: CellValue;
}

export interface Competitor {
  slug: string;
  name: string;
  url: string;
  tagline: string;
  summary: string;
  ourPitch: string;
  theirPitch: string;
  rows: ComparisonRow[];
  verdict: string;
}

export const competitors: Competitor[] = [
  {
    slug: "canny",
    name: "Canny",
    url: "https://canny.io",
    tagline: "Track customer feedback",
    summary:
      "Canny is a mature feedback-and-roadmap tool built for PMs. You install a widget, customers file requests, your team prioritizes, and you publish a changelog. It stops at the PM handoff — engineering picks up from Canny's Jira/Linear integration.",
    ourPitch:
      "FeedbackIQ ingests the same kind of feedback, then closes the loop. Claude reads the report, writes the fix or feature, and opens a PR on your repo — dedup'd with pgvector so 500-errors don't spam the roadmap.",
    theirPitch:
      "Canny ships a polished voting UI, prioritization scoring, and a changelog. Great if your bottleneck is understanding what users want. Doesn't touch code.",
    verdict:
      "Choose Canny if your engineering throughput isn't the problem — you need prioritization. Choose FeedbackIQ if the bottleneck is the gap between 'we know what to build' and 'it's merged.'",
    rows: [
      { feature: "Feedback widget", us: true, them: true },
      { feature: "Public roadmap", us: true, them: true },
      { feature: "Public changelog", us: true, them: true },
      { feature: "Upvoting", us: true, them: true },
      { feature: "Auto-deduplication (vector similarity)", us: true, them: "Manual merge" },
      { feature: "AI auto-tagging of submissions", us: true, them: "Add-on" },
      { feature: "Auto-generated pull requests", us: true, them: false },
      { feature: "AI-generated changelog from merged PRs", us: true, them: false },
      { feature: "Screenshot attachments", us: true, them: true },
      { feature: "Free tier", us: "Yes", them: "Yes (limited)" },
      { feature: "Self-hosted option", us: false, them: false },
    ],
  },
  {
    slug: "featurebase",
    name: "Featurebase",
    url: "https://featurebase.app",
    tagline: "Feedback · Roadmap · Changelog",
    summary:
      "Featurebase is the modern take on Canny — cleaner UI, similar pricing, same workflow. You collect feedback, surface upvoted items, and ship a changelog. The AI features focus on categorization and summarization, not code generation.",
    ourPitch:
      "We overlap on the widget, roadmap, and changelog. Where we diverge: FeedbackIQ writes the PR. Every upvoted item is one click (or one AI run) away from a merged commit.",
    theirPitch:
      "Featurebase is the best-looking feedback-tracker in the space. If you're a content/marketing-heavy SaaS and want engagement metrics, surveys, and help-center integration, it's the safer pick.",
    verdict:
      "Featurebase wins on breadth of product-feedback features. FeedbackIQ wins the moment you count engineer-hours saved per shipped feature.",
    rows: [
      { feature: "Feedback widget", us: true, them: true },
      { feature: "Public roadmap", us: true, them: true },
      { feature: "Changelog + RSS/Atom", us: true, them: true },
      { feature: "AI auto-tagging", us: true, them: true },
      { feature: "Auto-deduplication (vector)", us: true, them: "Keyword" },
      { feature: "Auto-generated pull requests", us: true, them: false },
      { feature: "GitHub App installed on your repo", us: true, them: false },
      { feature: "AI-written PR code + tests", us: true, them: false },
      { feature: "Screenshot attachments", us: true, them: true },
      { feature: "Surveys", us: false, them: true },
      { feature: "Help center", us: false, them: true },
    ],
  },
  {
    slug: "uservoice",
    name: "UserVoice",
    url: "https://uservoice.com",
    tagline: "Enterprise product feedback",
    summary:
      "UserVoice is the enterprise incumbent. Rich segmentation, SmartVote prioritization, account-level voting, and integrations with Salesforce and Gainsight. Priced accordingly — deals usually start in the low five figures.",
    ourPitch:
      "FeedbackIQ is priced for teams shipping now, not procurement reviews. Our USP — code generation — doesn't exist anywhere in UserVoice. If your engineering team is the bottleneck (not your PMs), UserVoice solves the wrong problem.",
    theirPitch:
      "UserVoice is the incumbent for a reason. If your buyer is a VP of Product at a 500-person company and the compliance team needs SOC 2 Type II, it's the right tool.",
    verdict:
      "UserVoice is built for the enterprise motion. FeedbackIQ is built for the 'one-engineer-turns-into-many' motion.",
    rows: [
      { feature: "Feedback widget", us: true, them: true },
      { feature: "Public roadmap", us: true, them: true },
      { feature: "Account-level segmentation", us: false, them: true },
      { feature: "Salesforce / Gainsight integration", us: false, them: true },
      { feature: "Auto-generated pull requests", us: true, them: false },
      { feature: "AI code generation", us: true, them: false },
      { feature: "SOC 2 Type II", us: "In progress", them: true },
      { feature: "Priced for <50-person teams", us: true, them: false },
      { feature: "Open roadmap for our own roadmap", us: true, them: false },
    ],
  },
  {
    slug: "productboard",
    name: "Productboard",
    url: "https://productboard.com",
    tagline: "Product management platform",
    summary:
      "Productboard is a PM system of record. Research repository, feature matrices, Jira/Linear sync, internal roadmaps. It's where the product team lives before anything hits engineering.",
    ourPitch:
      "Productboard stops at the handoff. FeedbackIQ picks up after it. Installing both isn't crazy — Productboard for strategy, FeedbackIQ for the 40% of tickets that are 'small, obvious, go.'",
    theirPitch:
      "If your product org runs on 'insights → ideas → features,' Productboard is designed around that abstraction layer. Better upward reporting, richer segmentation.",
    verdict:
      "Different jobs. Productboard is for deciding what to build. FeedbackIQ is for actually shipping the easy 40% so your PMs can focus on the hard 60%.",
    rows: [
      { feature: "Public feedback widget", us: true, them: "Via Portal add-on" },
      { feature: "Public roadmap", us: true, them: true },
      { feature: "Idea scoring / prioritization", us: false, them: true },
      { feature: "Jira / Linear sync", us: false, them: true },
      { feature: "Auto-generated pull requests", us: true, them: false },
      { feature: "GitHub App", us: true, them: false },
      { feature: "AI feedback summarization", us: true, them: true },
      { feature: "AI code generation", us: true, them: false },
      { feature: "Starts free", us: true, them: false },
    ],
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}
