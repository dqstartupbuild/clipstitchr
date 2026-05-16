type SiteUrlEnvironment = Record<string, string | undefined>;

const fallbackSiteUrl = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function firstSiteUrl(...values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = normalizeSiteUrl(value);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function resolveSiteUrl(env: SiteUrlEnvironment = process.env) {
  const configuredSiteUrl = firstSiteUrl(
    env.NEXT_PUBLIC_SITE_URL,
    env.SITE_URL,
  );
  const configuredPreviewSiteUrl = firstSiteUrl(
    env.NEXT_PUBLIC_PREVIEW_SITE_URL,
    env.PREVIEW_SITE_URL,
  );

  if (env.VERCEL_ENV === "preview") {
    return (
      configuredPreviewSiteUrl ??
      firstSiteUrl(env.VERCEL_BRANCH_URL, env.VERCEL_URL) ??
      configuredSiteUrl ??
      firstSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL) ??
      fallbackSiteUrl
    );
  }

  if (env.VERCEL_ENV === "production") {
    return (
      configuredSiteUrl ??
      firstSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL) ??
      fallbackSiteUrl
    );
  }

  return (
    configuredSiteUrl ??
    firstSiteUrl(
      env.VERCEL_BRANCH_URL,
      env.VERCEL_URL,
      env.VERCEL_PROJECT_PRODUCTION_URL,
    ) ??
    fallbackSiteUrl
  );
}
