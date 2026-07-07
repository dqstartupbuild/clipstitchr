const featureRouteMap: Record<string, string> = {
  analytics: "/dashboard/analytics",
  avatars: "/dashboard/library",
  clipr: "/dashboard/clipr",
  hooks: "/dashboard/hooks",
  library: "/dashboard/library",
  onboarding: "/dashboard/onboarding",
  schedule: "/dashboard/schedule",
  settings: "/dashboard/settings",
  stitchr: "/dashboard/stitchr",
  swapr: "/dashboard/swapr",
  swipr: "/dashboard/swipr",
  templates: "/dashboard/library",
  uploads: "/dashboard/library",
};

export function getAppContextRoutePathForFile(relativeFilePath: string) {
  const normalizedPath = relativeFilePath.replace(/\\/g, "/").toLowerCase();
  const dashboardRouteMatch = normalizedPath.match(
    /(?:^|\/)(?:src\/)?app\/dashboard\/([^/]+)/,
  );

  if (dashboardRouteMatch?.[1]) {
    return `/dashboard/${dashboardRouteMatch[1]}`;
  }

  if (/(?:^|\/)(?:src\/)?app\/dashboard(?:\/|$)/.test(normalizedPath)) {
    return "/dashboard";
  }

  if (/(?:^|\/)(?:src\/)?app\/cli\/connect(?:\/|$)/.test(normalizedPath)) {
    return "/cli/connect";
  }

  for (const [feature, routePath] of Object.entries(featureRouteMap)) {
    if (new RegExp(`(?:^|/)${feature}(?:/|$)`).test(normalizedPath)) {
      return routePath;
    }
  }

  if (/(?:^|\/)(?:src\/)?app\/page\.[jt]sx$/.test(normalizedPath)) {
    return "/";
  }

  return undefined;
}
