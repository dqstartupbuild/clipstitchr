import { normalizeApifyProfileUsername } from "@/lib/clipstitchr/server/apify/normalizeApifyProfileUsername";

export function createInstagramProfileAnalyticsInput(username: string) {
  const normalizedUsername = normalizeApifyProfileUsername(username);

  return {
    addParentData: false,
    directUrls: [`https://www.instagram.com/${normalizedUsername}/`],
    resultsLimit: 30,
    resultsType: "posts",
  };
}
