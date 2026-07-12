import type { HookLabIdeaUseStatus } from "@/lib/clipstitchr/types/HookLabIdeaUseStatus";
import type { HookLabIdeaUseVariant } from "@/lib/clipstitchr/types/HookLabIdeaUseVariant";

export type HookLabIdeaUseProgress = {
  completedVariantCount: number;
  failedVariantCount: number;
  id: string;
  progress: number;
  status: HookLabIdeaUseStatus;
  variationCount: number;
  variants: HookLabIdeaUseVariant[];
};
