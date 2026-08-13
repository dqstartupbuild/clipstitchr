import { describe, expect, it } from "vitest";
import { readStudioClipsOutputMaterializeRequest } from "./readStudioClipsOutputMaterializeRequest";

describe("readStudioClipsOutputMaterializeRequest", () => {
  it("accepts the exact bounded Library-save request", async () => {
    await expect(
      readStudioClipsOutputMaterializeRequest(
        new Request("https://clipstitchr.test", {
          body: JSON.stringify({
            expectedRevision: 2,
            idempotencyKey: "materialize-output_1",
            productId: "product_1",
            taskId: "task_1",
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
      ),
    ).resolves.toEqual({
      expectedRevision: 2,
      idempotencyKey: "materialize-output_1",
      productId: "product_1",
      taskId: "task_1",
    });
  });

  it("rejects unknown keys and invalid revisions", async () => {
    await expect(
      readStudioClipsOutputMaterializeRequest(
        new Request("https://clipstitchr.test", {
          body: JSON.stringify({
            expectedRevision: 0,
            idempotencyKey: "save",
            productId: "product_1",
            taskId: "task_1",
            ownerId: "other_user",
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
      ),
    ).rejects.toThrow();
  });
});
