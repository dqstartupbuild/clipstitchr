import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

export const defaultCreativeAssetInventoryRows: CreativeAssetInventoryRow[] = [
  {
    assetType: "Hooks and opening lines",
    captureAction: "Write and record three clearly different opening takes.",
    id: "hooks",
    missing: 2,
    needsWork: 0,
    priority: 3,
    ready: 2,
    rightsUnknown: 0,
  },
  {
    assetType: "UGC clips",
    captureAction:
      "Capture clean UGC takes with extra handles before and after the line.",
    id: "ugc-clips",
    missing: 2,
    needsWork: 1,
    priority: 1,
    ready: 1,
    rightsUnknown: 0,
  },
  {
    assetType: "Product demos",
    captureAction:
      "Record a readable payoff demo without notifications or private data.",
    id: "product-demos",
    missing: 1,
    needsWork: 0,
    priority: 0,
    ready: 1,
    rightsUnknown: 0,
  },
  {
    assetType: "Avatar or presenter clips",
    captureAction:
      "Capture one direct-to-camera setup and two reusable reaction takes.",
    id: "avatars",
    missing: 1,
    needsWork: 0,
    priority: 4,
    ready: 0,
    rightsUnknown: 0,
  },
  {
    assetType: "Calls to action",
    captureAction:
      "Record one low-pressure next step and one direct action line.",
    id: "ctas",
    missing: 0,
    needsWork: 0,
    priority: 2,
    ready: 1,
    rightsUnknown: 0,
  },
  {
    assetType: "Finished ads",
    captureAction: "Build a control after the source gaps above are covered.",
    id: "finished-ads",
    missing: 1,
    needsWork: 1,
    priority: 5,
    ready: 0,
    rightsUnknown: 0,
  },
];
