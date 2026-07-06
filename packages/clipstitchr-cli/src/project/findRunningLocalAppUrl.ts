import { commonLocalAppUrls } from "./commonLocalAppUrls.js";
import { isHttpUrlReachable } from "./isHttpUrlReachable.js";

export async function findRunningLocalAppUrl(preferredUrl?: string) {
  const urls = [
    ...(preferredUrl ? [preferredUrl] : []),
    ...commonLocalAppUrls.filter((url) => url !== preferredUrl),
  ];

  for (const url of urls) {
    if (await isHttpUrlReachable(url)) {
      return url;
    }
  }

  return undefined;
}
