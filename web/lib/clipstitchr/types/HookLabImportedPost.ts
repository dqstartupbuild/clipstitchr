import type { HookLabPostMetrics } from "@/lib/clipstitchr/types/HookLabPostMetrics";
import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";

export type HookLabImportedPost = {
  authorName?: string;
  authorProfileUrl?: string;
  authorUsername?: string;
  canonicalUrl: string;
  metrics: HookLabPostMetrics;
  platform: HookLabPostPlatform;
  sourceCreatedAt?: string;
  sourcePostId?: string;
  sourceText?: string;
  temporaryVideoUrl?: string;
  thumbnailUrl?: string;
};
