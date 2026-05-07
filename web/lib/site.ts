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
  publisherName: "@dqstartupbuild",
  defaultTitle: "Clipr",
  defaultDescription:
    "Clipr lets users upload UGC reaction clips and product demo videos, then automatically stitches them together to produce polished marketing videos.",
  keywords: [] as string[],
  ctaUrl: "#",
  ctaLabel: "Get Started",
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
