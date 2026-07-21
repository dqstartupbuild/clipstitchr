import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import type { HookLabCreativeBriefStatus } from "@/lib/clipstitchr/types/HookLabCreativeBriefStatus";
import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";

export type HookLabCreativeBrief = {
  brief: HookLabCreativeBriefContent;
  createdAt: string;
  destinationTool: HookLabDestinationTool;
  formatDnaVersion: string;
  hookTemplateId?: string;
  id: string;
  productId: string;
  sourcePostIds: string[];
  status: HookLabCreativeBriefStatus;
  updatedAt: string;
};
