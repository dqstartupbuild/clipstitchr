import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

export type StitchrBatchHookPlanItem = {
  angle?: string;
  automationRunId?: string;
  automationTaskId: string;
  caption: string;
  demoClipId?: string;
  demoClipName?: string;
  hashtags: string[];
  hookOptions: StitchrHookVariant[];
  productId?: string;
  productName?: string;
  providerModel?: string;
  providerPredictionId?: string;
  reason?: string;
  selectedHook: string;
  socialCaption: string;
  ugcClipId?: string;
  ugcClipName?: string;
};
