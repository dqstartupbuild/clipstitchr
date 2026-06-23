import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

export type StitchrBatchHookPlanningInput = {
  automationRunId: string;
  automationTaskId: string;
  demoClipId: string;
  demoClipName: string;
  hasTemplateTextOverlay: boolean;
  product: ProductProfile;
  stitchrClipContexts: StitchrTextGenerationClipContext[];
  ugcClipId: string;
  ugcClipName: string;
};
