import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";

export type HookLabIdeaUpdateInput = {
  name: string;
  productId?: string;
  scope: HookLabIdeaScope;
  whatToRepeat?: string;
};
