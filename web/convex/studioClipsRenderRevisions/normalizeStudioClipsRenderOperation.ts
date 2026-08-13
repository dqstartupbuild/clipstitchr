import type { StudioClipsRenderOperation } from "../../lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import { normalizeStudioClipsOutputEditOperation } from "../studioClipsOutputs/normalizeStudioClipsOutputEditOperation";
import { normalizeStudioClipsCaptionStyle } from "../studioClipsTasks/normalizeStudioClipsCaptionStyle";

export function normalizeStudioClipsRenderOperation(
  operation: StudioClipsRenderOperation,
  ownerId: string,
  productId: string,
): StudioClipsRenderOperation {
  if (operation.kind === "platform_export") return operation;
  if (operation.kind === "project_style") {
    return {
      kind: "project_style",
      style: normalizeStudioClipsCaptionStyle(
        operation.style,
        ownerId,
        productId,
      ),
    };
  }
  if (
    operation.kind === "trim" ||
    operation.kind === "split" ||
    operation.kind === "merge" ||
    operation.kind === "captions" ||
    operation.kind === "regenerate"
  ) {
    return normalizeStudioClipsOutputEditOperation(
      operation,
      ownerId,
      productId,
    ) as StudioClipsRenderOperation;
  }
  throw new Error("Studio Clips render operation is invalid.");
}
