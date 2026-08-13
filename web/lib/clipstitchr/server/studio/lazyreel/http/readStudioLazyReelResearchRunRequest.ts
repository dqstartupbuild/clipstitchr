import type { StudioLazyReelResearchRunRequest } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelResearchRunRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelBoundedJsonBody } from "./readLazyReelBoundedJsonBody";
import { readLazyReelObject } from "./readLazyReelObject";
import { readLazyReelRequiredString } from "./readLazyReelRequiredString";
import { readLazyReelToolRequest } from "./readLazyReelToolRequest";

export async function readStudioLazyReelResearchRunRequest(
  request: Request,
): Promise<StudioLazyReelResearchRunRequest> {
  const body = readLazyReelObject(
    await readLazyReelBoundedJsonBody(request),
    "Request body",
  );

  return {
    idempotencyKey: readLazyReelRequiredString(
      body.idempotencyKey,
      "Idempotency key",
      lazyReelResearchInputLimits.idempotencyKey,
    ),
    productId: readLazyReelRequiredString(
      body.productId,
      "Product",
      lazyReelResearchInputLimits.productId,
    ),
    request: readLazyReelToolRequest(body.request),
  };
}
