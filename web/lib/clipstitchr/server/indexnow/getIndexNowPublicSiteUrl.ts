import { site } from "@/lib/site";

const localHostnames = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function getIndexNowPublicSiteUrl() {
  const siteUrl = new URL(site.url);

  if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
    throw new Error("IndexNow submissions require an http(s) site URL.");
  }

  if (localHostnames.has(siteUrl.hostname)) {
    throw new Error(
      "IndexNow submissions require NEXT_PUBLIC_SITE_URL to point to the public website.",
    );
  }

  return siteUrl.toString();
}
