import { PublishingServiceConfigurationError } from "@/lib/clipstitchr/publishing/service/PublishingServiceConfigurationError";

export function readPublishingWebOrigin(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    throw new PublishingServiceConfigurationError();
  }

  try {
    const url = new URL(value);
    const permitsLocalHttp =
      process.env.NODE_ENV !== "production" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");

    if (
      (url.protocol !== "https:" && !(url.protocol === "http:" && permitsLocalHttp)) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new TypeError("Invalid publishing web origin.");
    }

    return url.origin;
  } catch {
    throw new PublishingServiceConfigurationError();
  }
}
