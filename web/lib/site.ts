const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "http://localhost:3000";

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
  name: "Clipr",
  url: configuredSiteUrl.replace(/\/$/, ""),
  publisherName: "Clipr",
  defaultTitle: "Clipr | Browser UGC Video Stitching",
  defaultDescription:
    "Clipr lets teams normalize UGC clips and product demos to TikTok 9:16, stitch UGC first then demo, and export browser-created MP4 videos.",
  keywords: [
    "UGC video editor",
    "TikTok video maker",
    "product demo videos",
    "browser video stitching",
    "9:16 video editor",
  ],
  ctaUrl: "/dashboard",
  ctaLabel: "Go to Dashboard",
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
      pathname: "/dashboard",
      changeFrequency: "weekly" as const,
      priority: 0.75,
    },
    {
      pathname: "/dashboard/create",
      changeFrequency: "weekly" as const,
      priority: 0.72,
    },
    {
      pathname: "/dashboard/uploads",
      changeFrequency: "weekly" as const,
      priority: 0.68,
    },
    {
      pathname: "/dashboard/swapr",
      changeFrequency: "weekly" as const,
      priority: 0.68,
    },
    {
      pathname: "/dashboard/created",
      changeFrequency: "weekly" as const,
      priority: 0.68,
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

export function createOgImageUrl(pathname = "/") {
  return createCanonicalUrl(createOgAssetPath(pathname));
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
