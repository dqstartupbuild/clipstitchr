import type { HookLabCreativeBrief } from "@/lib/clipstitchr/types/HookLabCreativeBrief";
import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import { getJsonResponse } from "@/lib/clipstitchr/client/getJsonResponse";

export async function createHookLabCreativeBrief(input: {
  destinationTool: HookLabDestinationTool;
  hookTemplateId?: string;
  productId: string;
  sourcePostId: string;
}) {
  const response = await fetch("/api/hook-lab/briefs", {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  return await getJsonResponse<{
    brief: HookLabCreativeBrief;
    relatedTemplates: HookLibraryTemplateSummary[];
  }>(response);
}
