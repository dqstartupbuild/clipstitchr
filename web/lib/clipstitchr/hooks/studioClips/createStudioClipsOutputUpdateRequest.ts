import type { StudioClipsOutputUpdateRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutputUpdateRequest";
import type { StudioClipsOutput } from "./StudioClipsOutput";
import type { StudioClipsOutputEdit } from "./StudioClipsOutputEdit";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";

export function createStudioClipsOutputUpdateRequest(
  productId: string,
  taskId: string,
  output: StudioClipsOutput,
  edit: StudioClipsOutputEdit,
): StudioClipsOutputUpdateRequest {
  return {
    edit,
    expectedRevision: output.revision,
    idempotencyKey: createStudioClipsIdempotencyKey(edit.kind),
    productId,
    taskId,
  };
}
