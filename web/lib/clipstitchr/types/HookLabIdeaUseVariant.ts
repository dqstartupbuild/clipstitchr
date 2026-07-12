import type { HookLabIdeaVariantStatus } from "@/lib/clipstitchr/types/HookLabIdeaVariantStatus";

export type HookLabIdeaUseVariant = {
  finishedStitchId?: string;
  id: string;
  status: HookLabIdeaVariantStatus;
  variantIndex: number;
};
