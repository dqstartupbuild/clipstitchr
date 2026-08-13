import type { StudioClipsOutputMaterializeRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutputMaterializeRequest";
import type { StudioClipsOutput } from "./StudioClipsOutput";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";

export function createStudioClipsOutputMaterializeRequest(
  productId: string,
  taskId: string,
  output: StudioClipsOutput,
): StudioClipsOutputMaterializeRequest {
  return {
    expectedRevision: output.revision,
    idempotencyKey: createStudioClipsIdempotencyKey("materialize"),
    productId,
    taskId,
  };
}
