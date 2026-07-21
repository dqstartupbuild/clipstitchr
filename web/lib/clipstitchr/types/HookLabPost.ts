import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { HookLabPostMediaKind } from "@/lib/clipstitchr/types/HookLabPostMediaKind";
import type { HookLabPostMetrics } from "@/lib/clipstitchr/types/HookLabPostMetrics";
import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";
import type { HookLabPostStatus } from "@/lib/clipstitchr/types/HookLabPostStatus";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type HookLabPost = {
  analysis?: HookLabPostAnalysis;
  analyzedAt?: string;
  authorName?: string;
  authorProfileUrl?: string;
  authorUsername?: string;
  canonicalUrl: string;
  createdAt: string;
  durationSeconds?: number;
  failureMessage?: string;
  id: string;
  metrics: HookLabPostMetrics;
  mediaKind?: HookLabPostMediaKind;
  platform: HookLabPostPlatform;
  sourceCreatedAt?: string;
  sourcePostId?: string;
  sourceText?: string;
  status: HookLabPostStatus;
  thumbnailObject?: R2ObjectReference;
  updatedAt: string;
};
