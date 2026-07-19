import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";

export type HookLabPostDocument = {
  canonicalUrl: string;
  id: string;
  platform: HookLabPostPlatform;
  providerDatasetId?: string;
  providerRunId?: string;
};
