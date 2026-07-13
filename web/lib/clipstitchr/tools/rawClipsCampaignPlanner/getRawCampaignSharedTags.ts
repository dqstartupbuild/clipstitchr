import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";
import { getRawCampaignAssetTags } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/getRawCampaignAssetTags";

export function getRawCampaignSharedTags(
  assets: readonly RawCampaignAsset[],
): readonly string[] {
  const counts = new Map<string, number>();

  for (const asset of assets) {
    for (const tag of getRawCampaignAssetTags(asset)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort(
      ([tagA, countA], [tagB, countB]) =>
        countB - countA || tagA.localeCompare(tagB),
    )
    .map(([tag]) => tag);
}
