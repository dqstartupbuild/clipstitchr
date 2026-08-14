import type { SocialPublishingPostingFrequency } from "@/lib/clipstitchr/types/SocialPublishingPostingFrequency";

export function getSocialPublishingBestPostingFrequency(
  rows: SocialPublishingPostingFrequency[],
) {
  return [
    ...rows.reduce(
      (bestByPlatform, row) => {
        const existing = bestByPlatform.get(row.platform);

        if (
          !existing ||
          row.averageEngagementRate > existing.averageEngagementRate
        ) {
          bestByPlatform.set(row.platform, row);
        }

        return bestByPlatform;
      },
      new Map<
        SocialPublishingPostingFrequency["platform"],
        SocialPublishingPostingFrequency
      >(),
    ).values(),
  ].sort((a, b) => b.averageEngagementRate - a.averageEngagementRate);
}
