import type { HookLabPostMetrics } from "@/lib/clipstitchr/types/HookLabPostMetrics";
import type { HookLabPostMediaKind } from "@/lib/clipstitchr/types/HookLabPostMediaKind";
import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";

export type HookLabImportedPost = {
  authorName?: string;
  authorProfileUrl?: string;
  authorUsername?: string;
  canonicalUrl: string;
  mediaKind: HookLabPostMediaKind;
  metrics: HookLabPostMetrics;
  platform: HookLabPostPlatform;
  sourceCreatedAt?: string;
  sourcePostId?: string;
  sourceText?: string;
  temporaryImageUrls?: string[];
  temporaryVideoUrl?: string;
  thumbnailUrl?: string;
};
