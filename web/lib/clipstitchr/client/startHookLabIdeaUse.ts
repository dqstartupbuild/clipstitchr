import type { HookLabIdeaUseResult } from "@/lib/clipstitchr/types/HookLabIdeaUseResult";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";
import { createId } from "@/lib/clipstitchr/utils/createId";

type StartHookLabIdeaUseInput = {
  defaultAvatarId?: string;
  defaultDemoClipId?: string;
  productId: string;
  saveDefaults?: boolean;
  variationCount: HookLabIdeaVariationCount;
};

export async function startHookLabIdeaUse(
  id: string,
  input: StartHookLabIdeaUseInput,
): Promise<HookLabIdeaUseResult> {
  const response = await fetch(
    `/api/hook-lab/ideas/${encodeURIComponent(id)}/use`,
    {
      body: JSON.stringify(input),
      headers: {
        "content-type": "application/json",
        "idempotency-key": createId(),
      },
      method: "POST",
    },
  );
  const body = (await response.json().catch(() => null)) as
    | Partial<HookLabIdeaUseResult>
    | null;

  if (!response.ok) {
    throw new Error(body?.message ?? "Unable to use that idea right now.");
  }

  if (!body?.useId || !Array.isArray(body.variantIds)) {
    throw new Error("That idea started, but its progress could not be loaded.");
  }

  return {
    message: body.message,
    useId: body.useId,
    variantIds: body.variantIds,
  };
}
