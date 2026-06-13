import { getFirecrawlApiKey } from "@/lib/clipstitchr/server/getFirecrawlApiKey";

export function createFirecrawlRequestHeaders() {
  return {
    authorization: `Bearer ${getFirecrawlApiKey()}`,
    "content-type": "application/json",
  };
}
