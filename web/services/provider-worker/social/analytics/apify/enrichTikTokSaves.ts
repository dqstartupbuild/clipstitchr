import { getSocialAnalyticsApifyDatasetItems } from "./getSocialAnalyticsApifyDatasetItems";
import { getSocialAnalyticsApifyMaxTotalChargeUsd } from "./getSocialAnalyticsApifyMaxTotalChargeUsd";
import { getSocialAnalyticsApifyUrlLimit } from "./getSocialAnalyticsApifyUrlLimit";
import { readTikTokSaveCounts } from "./readTikTokSaveCounts";
import { startSocialAnalyticsApifyRun } from "./startSocialAnalyticsApifyRun";
import { waitForSocialAnalyticsApifyRun } from "./waitForSocialAnalyticsApifyRun";

export async function enrichTikTokSaves(
  publications: Array<{
    externalPublicationId: string;
    permalink?: string;
    username: string;
  }>,
) {
  const limit = getSocialAnalyticsApifyUrlLimit();
  const selected = publications.slice(0, limit);
  const postUrls = selected.map(
    (publication) =>
      publication.permalink ||
      `https://www.tiktok.com/@${encodeURIComponent(publication.username)}/video/${encodeURIComponent(publication.externalPublicationId)}`,
  );
  const maxTotalChargeUsd = getSocialAnalyticsApifyMaxTotalChargeUsd();
  const run = await startSocialAnalyticsApifyRun({
    postUrls,
    maxTotalChargeUsd,
  });
  const completed = await waitForSocialAnalyticsApifyRun(run.id);
  const items = await getSocialAnalyticsApifyDatasetItems(
    completed.defaultDatasetId!,
    selected.length,
  );

  return {
    maxTotalChargeUsd,
    runCount: 1,
    savesByExternalId: readTikTokSaveCounts(items),
    skippedCount: Math.max(0, publications.length - selected.length),
  };
}
