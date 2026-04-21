import type { Metadata } from "next";

export const SITE_URL = "https://feedbackiq.app";
export const SITE_NAME = "FeedbackIQ";
export const SITE_DESCRIPTION =
  "User feedback turned into shipped code. Claude reads your feedback, writes the PR, opens it on GitHub.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

interface BuildMetadataArgs {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
  noIndex,
}: BuildMetadataArgs): Metadata {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const desc = description ?? SITE_DESCRIPTION;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
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
