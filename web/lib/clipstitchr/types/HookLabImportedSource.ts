import type { HookLabSourcePlatform } from "@/lib/clipstitchr/types/HookLabSourcePlatform";

export type HookLabImportedSource = {
  authorName?: string;
  authorProfileUrl?: string;
  authorUsername?: string;
  canonicalUrl: string;
  platform: HookLabSourcePlatform;
  sourceCreatedAt?: string;
  sourcePostId?: string;
  sourceText?: string;
  temporaryVideoUrl?: string;
  thumbnailUrl?: string;
};
