import type { IndexNowPayload } from "@/lib/clipstitchr/server/indexnow/IndexNowPayload";
import { createIndexNowKeyLocationUrl } from "@/lib/clipstitchr/server/indexnow/createIndexNowKeyLocationUrl";
import { indexNowKey } from "@/lib/clipstitchr/server/indexnow/indexNowKey";
import { maxIndexNowUrlCount } from "@/lib/clipstitchr/server/indexnow/maxIndexNowUrlCount";

type CreateIndexNowPayloadOptions = {
  siteUrl: string;
  urls: string[];
};

export function createIndexNowPayload({
  siteUrl,
  urls,
}: CreateIndexNowPayloadOptions): IndexNowPayload {
  if (urls.length === 0) {
    throw new Error("No public URLs are available for IndexNow submission.");
  }

  if (urls.length > maxIndexNowUrlCount) {
    throw new Error(
      `IndexNow submissions are limited to ${maxIndexNowUrlCount} URLs.`,
    );
  }

  const site = new URL(siteUrl);

  return {
    host: site.host,
    key: indexNowKey,
    keyLocation: createIndexNowKeyLocationUrl(site.toString()),
    urlList: urls,
  };
}
