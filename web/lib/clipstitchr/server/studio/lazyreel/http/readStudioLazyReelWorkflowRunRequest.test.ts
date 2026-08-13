import { describe, expect, it } from "vitest";
import { readStudioLazyReelWorkflowRunRequest } from "./readStudioLazyReelWorkflowRunRequest";

function createRequest(body: unknown) {
  return new Request("https://clipstitchr.test/api/studio/research/workflows", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("readStudioLazyReelWorkflowRunRequest", () => {
  it("normalizes a supported bounded workflow request", async () => {
    await expect(
      readStudioLazyReelWorkflowRunRequest(
        createRequest({
          idempotencyKey: " workflow-123 ",
          productId: " product-123 ",
          request: {
            brief: " Build a clear 15-second creator-led ad. ",
            targetDurationSeconds: 15,
            workflow: "ugc_ad_director",
          },
        }),
      ),
    ).resolves.toEqual({
      idempotencyKey: "workflow-123",
      productId: "product-123",
      request: {
        brief: "Build a clear 15-second creator-led ad.",
        targetDurationSeconds: 15,
        workflow: "ugc_ad_director",
      },
    });
  });

  it("rejects unknown workflows and unbounded durations", async () => {
    await expect(
      readStudioLazyReelWorkflowRunRequest(
        createRequest({
          idempotencyKey: "workflow-123",
          productId: "product-123",
          request: { brief: "A useful brief", workflow: "shell_runner" },
        }),
      ),
    ).rejects.toThrow("Choose one of the available LazyReel workflows.");

    await expect(
      readStudioLazyReelWorkflowRunRequest(
        createRequest({
          idempotencyKey: "workflow-123",
          productId: "product-123",
          request: {
            brief: "A useful brief",
            targetDurationSeconds: 181,
            workflow: "video_editor",
          },
        }),
      ),
    ).rejects.toThrow("Target duration must be a whole number from 5 to 180.");
  });
});
