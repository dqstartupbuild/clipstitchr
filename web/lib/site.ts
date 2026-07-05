import { resolveSiteUrl } from "./resolveSiteUrl";

const configuredSiteUrl = resolveSiteUrl();

function normalizePathname(pathname = "/") {
  if (!pathname) {
    return "/";
  }

  let normalized = pathname.trim();

  try {
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      normalized = new URL(normalized).pathname;
    }
  } catch {
    normalized = pathname;
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

export const site = {
  name: "ClipStitchr",
  url: configuredSiteUrl.replace(/\/$/, ""),
  publisherName: "ClipStitchr",
  defaultTitle: "ClipStitchr | Turn Raw Footage Into Finished Ads",
  defaultDescription:
    "ClipStitchr helps indie app builders turn saved clips and product demos into TikTok and Reels ads without rebuilding the same editing workflow every week.",
  keywords: [
    "mobile app TikTok ads",
    "mobile app Reels ads",
    "UGC ad tool",
    "product demo ads",
    "short-form app ads",
    "app marketing videos",
    "make ads from clips",
    "video ads without editing",
  ],
  ctaUrl: "/dashboard",
  ctaLabel: "Open Dashboard",
  staticPages: [
    {
      pathname: "/",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      pathname: "/blog",
      changeFrequency: "weekly" as const,
      priority: 0.88,
    },
    {
      pathname: "/case-studies",
      changeFrequency: "weekly" as const,
      priority: 0.87,
    },
    {
      pathname: "/docs",
      changeFrequency: "weekly" as const,
      priority: 0.86,
    },
    {
      pathname: "/examples",
      changeFrequency: "weekly" as const,
      priority: 0.84,
    },
    {
      pathname: "/pricing",
      changeFrequency: "weekly" as const,
      priority: 0.83,
    },
    {
      pathname: "/privacy",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      pathname: "/terms",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ],
};

export function createCanonicalUrl(pathname = "/") {
  return new URL(normalizePathname(pathname), `${site.url}/`).toString();
}

export function createOgAssetPath(pathname = "/") {
  const normalized = normalizePathname(pathname);
  return normalized === "/" ? "/og/default.png" : `/og${normalized}.png`;
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.defaultDescription,
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.publisherName,
    url: site.url,
    description: site.defaultDescription,
  };
}
