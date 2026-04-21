import type { ReactNode } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readingMinutes: number;
  heroImage?: string;
  render: () => ReactNode;
}

import DedupePost from "./blog-posts/deduping-feedback-with-pgvector";

export const posts: BlogPost[] = [
  {
    slug: "deduping-feedback-with-pgvector",
    title: "Deduping user feedback with pgvector and Vercel AI Gateway",
    description:
      "How we kill '500 error' spam on the public roadmap: cosine similarity on OpenAI embeddings, HNSW indexes on Neon, auto-link above 0.92, and a dashboard review queue for the gray zone.",
    author: "FeedbackIQ team",
    date: "2026-04-21",
    readingMinutes: 7,
    heroImage: "/og/blog-deduping-feedback-with-pgvector.png",
    render: DedupePost,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
