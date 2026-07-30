import { createApifyActorRunUrl } from "@/lib/clipstitchr/server/apify/createApifyActorRunUrl";
import { fetchApifyJson } from "@/lib/clipstitchr/server/apify/fetchApifyJson";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";
import { parseApifyActorRun } from "@/lib/clipstitchr/server/apify/parseApifyActorRun";
import { getSocialAnalyticsApifyActorId } from "./getSocialAnalyticsApifyActorId";

export async function startSocialAnalyticsApifyRun({
  postUrls,
  maxTotalChargeUsd,
}: {
  postUrls: string[];
  maxTotalChargeUsd: number;
}) {
  if (postUrls.length < 1) {
    throw new Error("TikTok save enrichment needs at least one post URL.");
  }

  const response = await fetchApifyJson(
    createApifyActorRunUrl(
      getSocialAnalyticsApifyActorId(),
      getApifyApiToken(),
      maxTotalChargeUsd,
    ),
    {
      body: JSON.stringify({
        postURLs: postUrls,
        maxItems: postUrls.length,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadVideos: false,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
  );

  return parseApifyActorRun(response);
}
