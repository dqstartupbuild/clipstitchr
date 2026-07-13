import type { BlueprintAssetKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetKey";

export type BlueprintAssetGap = {
  key: BlueprintAssetKey;
  label: string;
  required: number;
  available: number;
  gap: number;
  guidance: string;
};
