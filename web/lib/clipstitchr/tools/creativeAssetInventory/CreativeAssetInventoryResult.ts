import type { CreativeAssetInventoryGap } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryGap";

export type CreativeAssetInventoryResult = {
  coveragePercent: number | null;
  gaps: CreativeAssetInventoryGap[];
  missing: number;
  needsWork: number;
  ready: number;
  rightsUnknown: number;
  total: number;
};
