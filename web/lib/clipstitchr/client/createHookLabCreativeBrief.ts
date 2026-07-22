import type { HookLabCreativeBrief } from "@/lib/clipstitchr/types/HookLabCreativeBrief";
import { getJsonResponse } from "@/lib/clipstitchr/client/getJsonResponse";

export async function createHookLabCreativeBrief(input: {
  productId: string;
  sourcePostId: string;
}) {
  const response = await fetch("/api/hook-lab/briefs", {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  return await getJsonResponse<{ brief: HookLabCreativeBrief }>(response);
}
