import type { HookLabSourcePlatform } from "@/lib/clipstitchr/types/HookLabSourcePlatform";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type HookLabIdeaDocument = {
  canonicalUrl?: string;
  id: string;
  originalText?: string;
  providerDatasetId?: string;
  providerRunId?: string;
  sourcePlatform?: HookLabSourcePlatform;
  sourceType: string;
  thumbnailObject?: R2ObjectReference;
};
