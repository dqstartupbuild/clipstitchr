import { socialPublishingApiBaseUrl } from "@/lib/clipstitchr/server/socialPublishing/socialPublishingApiBaseUrl";

export function createSocialPublishingUrl(path: string, query?: URLSearchParams) {
  const url = new URL(path, socialPublishingApiBaseUrl);

  query?.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
}
