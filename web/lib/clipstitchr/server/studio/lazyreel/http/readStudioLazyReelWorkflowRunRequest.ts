import type { StudioLazyReelWorkflowRunRequest } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelWorkflowRunRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelBoundedJsonBody } from "./readLazyReelBoundedJsonBody";
import { readLazyReelObject } from "./readLazyReelObject";
import { readLazyReelRequiredString } from "./readLazyReelRequiredString";
import { readLazyReelWorkflowRequest } from "./readLazyReelWorkflowRequest";

export async function readStudioLazyReelWorkflowRunRequest(
  request: Request,
): Promise<StudioLazyReelWorkflowRunRequest> {
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
    request: readLazyReelWorkflowRequest(body.request),
  };
}
