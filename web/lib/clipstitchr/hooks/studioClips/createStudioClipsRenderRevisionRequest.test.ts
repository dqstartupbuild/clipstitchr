import { describe, expect, it } from "vitest";
import type { StudioClipsOutput } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutput";
import { createStudioClipsRenderRevisionRequest } from "./createStudioClipsRenderRevisionRequest";

describe("createStudioClipsRenderRevisionRequest", () => {
  it("freezes the Product, parent task, source output revision, and operation", () => {
    const request = createStudioClipsRenderRevisionRequest(
      "product_1",
      "task_1",
      { id: "output_1", revision: 4 } as StudioClipsOutput,
      { endSeconds: 12, kind: "trim", startSeconds: 2 },
    );

    expect(request).toMatchObject({
      operation: { endSeconds: 12, kind: "trim", startSeconds: 2 },
      productId: "product_1",
      schemaVersion: "studio-clips-render-revision-request-v1",
      sourceOutputId: "output_1",
      sourceOutputRevision: 4,
      taskId: "task_1",
    });
    expect(request.idempotencyKey).toMatch(/^render_trim-/u);
  });
});
