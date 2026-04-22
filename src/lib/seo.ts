import type { Metadata } from "next";

export const SITE_URL = "https://feedbackiq.app";
export const SITE_NAME = "FeedbackIQ";
export const SITE_DESCRIPTION =
  "User feedback turned into shipped code. Claude reads your feedback, writes the PR, opens it on GitHub.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

// Public social profiles used for Organization sameAs + future footer links.
export const SOCIAL_LINKS = {
  github: "https://github.com/simsketch/feedbackiq",
  x: "https://x.com/feedbackiq",
} as const;

interface BuildMetadataArgs {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
  rssFeedUrl?: string;
  rssFeedTitle?: string;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
  noIndex,
  rssFeedUrl,
  rssFeedTitle,
}: BuildMetadataArgs): Metadata {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const desc = description ?? SITE_DESCRIPTION;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;

  const alternates: Metadata["alternates"] = { canonical };
  if (rssFeedUrl) {
    alternates.types = {
      "application/atom+xml": [
        { url: rssFeedUrl, title: rssFeedTitle ?? `${SITE_NAME} feed` },
      ],
    };
  }

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates,
    openGraph: {
      title: fullTitle,
      description: desc,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
      ...(publishedTime && type === "article" ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    sameAs: Object.values(SOCIAL_LINKS),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
