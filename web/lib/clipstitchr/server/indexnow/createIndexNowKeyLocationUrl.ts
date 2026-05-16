import { indexNowKey } from "@/lib/clipstitchr/server/indexnow/indexNowKey";

export function createIndexNowKeyLocationUrl(siteUrl: string) {
  return new URL(`/${indexNowKey}.txt`, siteUrl).toString();
}
