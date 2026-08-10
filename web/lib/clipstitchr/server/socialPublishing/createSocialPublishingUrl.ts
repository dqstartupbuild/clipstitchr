import { socialPublishingApiBaseUrl } from "@/lib/clipstitchr/server/socialPublishing/socialPublishingApiBaseUrl";

export function createSocialPublishingUrl(path: string, query?: URLSearchParams) {
  const normalizedBaseUrl = `${socialPublishingApiBaseUrl.replace(/\/+$/, "")}/`;
  const baseUrl = new URL(normalizedBaseUrl);
  const normalizedPath = path.replace(/^\/+/, "");
  const baseIncludesVersion = baseUrl.pathname.replace(/\/+$/, "").endsWith("/v1");
  const relativePath =
    baseIncludesVersion && normalizedPath.startsWith("v1/")
      ? normalizedPath.slice(3)
      : normalizedPath;
  const url = new URL(relativePath, baseUrl);

  query?.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
}
