type ConvexUrlEnvironment = Record<string, string | undefined> & {
  CONVEX_URL?: string;
  NEXT_PUBLIC_CONVEX_URL?: string;
};

export function resolveConvexCloudUrl(
  environment: ConvexUrlEnvironment = process.env,
) {
  const configuredUrl =
    environment.CONVEX_URL?.trim() ||
    environment.NEXT_PUBLIC_CONVEX_URL?.trim();

  if (!configuredUrl) {
    throw new Error("Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.");
  }

  let url: URL;

  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("Convex URL must be a valid .convex.cloud URL.");
  }

  if (
    url.protocol !== "https:" ||
    !url.hostname.toLowerCase().endsWith(".convex.cloud")
  ) {
    throw new Error("Convex URL must be a valid .convex.cloud URL.");
  }

  return url.origin;
}
