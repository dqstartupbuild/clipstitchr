import { describe, expect, it, vi } from "vitest";
import { createStudioClipsOutputUpdateRequest } from "./createStudioClipsOutputUpdateRequest";

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "fixed-id",
}));

describe("createStudioClipsOutputUpdateRequest", () => {
  it("builds the exact revision-safe edit envelope", () => {
    const edit = {
      endSeconds: 18,
      kind: "trim" as const,
      startSeconds: 3,
    };
    const output = {
      artifactId: "artifact_1",
      contentType: "video/mp4",
      createdAt: "2026-08-12T10:00:00.000Z",
      edit: {
        acceptance: { state: "pending" as const },
        handoffs: [],
        regenerate: { state: "not_requested" as const },
        version: 1 as const,
      },
      id: "output_1",
      objectKey: "users/owner/studio/v1/media-output/output.mp4",
      productId: "product_1",
      revision: 7,
      sha256: "a".repeat(64),
      sizeBytes: 100,
      taskId: "task_1",
      updatedAt: "2026-08-12T10:00:00.000Z",
    };

    expect(
      createStudioClipsOutputUpdateRequest(
        "product_1",
        "task_1",
        output,
        edit,
      ),
    ).toEqual({
      edit,
      expectedRevision: 7,
      idempotencyKey: "trim-fixed-id",
      productId: "product_1",
      taskId: "task_1",
    });
  });
});
