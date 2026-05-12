const ALLOWED_REPLICATE_OUTPUT_HOSTS = new Set([
  "api.replicate.com",
  "replicate.delivery",
]);

export function getSafeReplicateOutputUrl(rawUrl: string | null) {
  if (!rawUrl) {
    throw new Error("Missing output URL.");
  }

  const url = new URL(rawUrl);

  if (url.protocol !== "https:") {
    throw new Error("Swapr output URLs must use HTTPS.");
  }

  if (
    !ALLOWED_REPLICATE_OUTPUT_HOSTS.has(url.hostname) &&
    !url.hostname.endsWith(".replicate.delivery")
  ) {
    throw new Error("Unsupported Swapr output host.");
  }

  return url;
}
