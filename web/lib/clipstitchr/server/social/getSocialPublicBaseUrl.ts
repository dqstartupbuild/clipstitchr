export function getSocialPublicBaseUrl() {
  const configured =
    process.env.SOCIAL_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (!configured) {
    throw new Error("Missing SOCIAL_PUBLIC_BASE_URL.");
  }

  const url = new URL(configured);
  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1";

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (!isLocal && url.protocol !== "https:")
  ) {
    throw new Error("SOCIAL_PUBLIC_BASE_URL must be a clean HTTPS origin.");
  }

  return url.origin;
}
