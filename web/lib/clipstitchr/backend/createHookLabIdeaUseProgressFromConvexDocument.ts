import type { HookLabIdeaUseProgress } from "@/lib/clipstitchr/types/HookLabIdeaUseProgress";
import type { HookLabIdeaUseStatus } from "@/lib/clipstitchr/types/HookLabIdeaUseStatus";
import type { HookLabIdeaVariantStatus } from "@/lib/clipstitchr/types/HookLabIdeaVariantStatus";

type HookLabIdeaUseProgressDocument = {
  use: {
    completedVariantCount: number;
    failedVariantCount: number;
    id: string;
    progress: number;
    status: string;
    variationCount: number;
  };
  variants: Array<{
    finishedStitchId?: string;
    id: string;
    status: string;
    variantIndex: number;
  }>;
};

export function createHookLabIdeaUseProgressFromConvexDocument(
  document: HookLabIdeaUseProgressDocument,
): HookLabIdeaUseProgress {
  return {
    completedVariantCount: document.use.completedVariantCount,
    failedVariantCount: document.use.failedVariantCount,
    id: document.use.id,
    progress: document.use.progress,
    status: document.use.status as HookLabIdeaUseStatus,
    variationCount: document.use.variationCount,
    variants: document.variants.map((variant) => ({
      finishedStitchId: variant.finishedStitchId,
      id: variant.id,
      status: variant.status as HookLabIdeaVariantStatus,
      variantIndex: variant.variantIndex,
    })),
  };
}
