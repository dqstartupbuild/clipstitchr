import type { StudioClipsOutput } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutput";
import type { StudioClipsRenderOperation } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import type { StudioClipsRenderRevisionRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionRequest";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";

export function createStudioClipsRenderRevisionRequest(
  productId: string,
  taskId: string,
  sourceOutput: StudioClipsOutput,
  operation: StudioClipsRenderOperation,
): StudioClipsRenderRevisionRequest {
  return {
    idempotencyKey: createStudioClipsIdempotencyKey(
      `render_${operation.kind}`,
    ),
    operation,
    productId,
    schemaVersion: "studio-clips-render-revision-request-v1",
    sourceOutputId: sourceOutput.id,
    sourceOutputRevision: sourceOutput.revision,
    taskId,
  };
}
