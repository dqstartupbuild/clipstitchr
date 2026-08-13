import type { TikTokPullMediaVerifier } from "./TikTokPullMediaVerifier.js";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{40,4096}$/u;

export const createTikTokPullMediaVerifier = (
  verifiedMediaOrigin: string,
  fetchImplementation: typeof fetch = globalThis.fetch,
): TikTokPullMediaVerifier => {
  const origin = new URL(verifiedMediaOrigin).origin;

  return async (url): Promise<boolean> => {
    const prefix = "/api/studio/publishing/media/";
    const token = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : "";

    if (
      url.origin !== origin ||
      url.search.length > 0 ||
      url.hash.length > 0 ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      token.includes("/") ||
      !TOKEN_PATTERN.test(token)
    ) {
      return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetchImplementation(url, {
        method: "HEAD",
        redirect: "error",
        signal: controller.signal,
      });
      const contentLength = response.headers.get("content-length");
      return (
        response.ok &&
        contentLength !== null &&
        /^\d+$/u.test(contentLength) &&
        Number(contentLength) > 0 &&
        response.headers.get("accept-ranges") === "bytes"
      );
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  };
};
