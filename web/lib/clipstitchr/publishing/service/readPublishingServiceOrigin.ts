import "server-only";

import { PublishingServiceConfigurationError } from "@/lib/clipstitchr/publishing/service/PublishingServiceConfigurationError";

export function readPublishingServiceOrigin() {
  const value = process.env.PUBLISHING_SERVICE_ORIGIN?.trim();

  if (!value) {
    throw new PublishingServiceConfigurationError();
  }

  try {
    const origin = new URL(value);
    const permitsLocalHttp =
      process.env.NODE_ENV !== "production" &&
      (origin.hostname === "127.0.0.1" || origin.hostname === "localhost");

    if (
      (origin.protocol !== "https:" && !(origin.protocol === "http:" && permitsLocalHttp)) ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash
    ) {
      throw new TypeError("Invalid publishing service origin.");
    }

    return origin.origin;
  } catch {
    throw new PublishingServiceConfigurationError();
  }
}
