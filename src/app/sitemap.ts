import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { competitors } from "@/content/competitors";
import { posts } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog/feed.xml`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const comparisonRoutes: MetadataRoute.Sitemap = competitors.map((c) => ({
    url: `${SITE_URL}/vs/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...comparisonRoutes, ...blogRoutes];
}
