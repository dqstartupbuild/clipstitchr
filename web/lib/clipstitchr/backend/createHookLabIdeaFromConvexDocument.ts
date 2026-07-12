import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";
import type { HookLabIdeaSourceType } from "@/lib/clipstitchr/types/HookLabIdeaSourceType";
import type { HookLabIdeaStatus } from "@/lib/clipstitchr/types/HookLabIdeaStatus";
import type { HookLabSourcePlatform } from "@/lib/clipstitchr/types/HookLabSourcePlatform";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type HookLabIdeaDocument = {
  attributionName?: string;
  attributionUrl?: string;
  canonicalUrl?: string;
  createdAt: string;
  creativeBeat?: unknown;
  failureMessage?: string;
  id: string;
  lastUsedAt?: string;
  name: string;
  originalText?: string;
  productId?: string;
  scope: string;
  sourcePlatform?: string;
  sourceStitchId?: string;
  sourceType: string;
  status: string;
  stitchRecipe?: unknown;
  textBlueprint?: unknown;
  thumbnailObject?: R2ObjectReference;
  updatedAt: string;
  useCount: number;
  whatToRepeat?: string;
};

export function createHookLabIdeaFromConvexDocument(
  document: HookLabIdeaDocument,
): HookLabIdea {
  return {
    attributionName: document.attributionName,
    attributionUrl: document.attributionUrl,
    canonicalUrl: document.canonicalUrl,
    createdAt: document.createdAt,
    failureMessage: document.failureMessage,
    hasCreativeBeat: document.creativeBeat !== undefined,
    hasStitchRecipe: document.stitchRecipe !== undefined,
    hasTextPattern: document.textBlueprint !== undefined,
    id: document.id,
    lastUsedAt: document.lastUsedAt,
    name: document.name,
    originalText: document.originalText,
    productId: document.productId,
    scope: document.scope as HookLabIdeaScope,
    sourcePlatform: document.sourcePlatform as HookLabSourcePlatform | undefined,
    sourceStitchId: document.sourceStitchId,
    sourceType: document.sourceType as HookLabIdeaSourceType,
    status: document.status as HookLabIdeaStatus,
    thumbnailObject: document.thumbnailObject,
    updatedAt: document.updatedAt,
    useCount: document.useCount,
    whatToRepeat: document.whatToRepeat,
  };
}
