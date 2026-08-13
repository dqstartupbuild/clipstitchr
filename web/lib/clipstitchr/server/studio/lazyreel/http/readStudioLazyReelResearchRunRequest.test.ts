import { describe, expect, it } from "vitest";
import { readStudioLazyReelResearchRunRequest } from "./readStudioLazyReelResearchRunRequest";

describe("readStudioLazyReelResearchRunRequest", () => {
  it("reads the bounded Product-scoped request", async () => {
    const request = new Request("https://clipstitchr.test/api/studio/research/runs", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: " run-123 ",
        productId: " product-123 ",
        request: {
          focus: "apps",
          tool: "niche_report",
        },
      }),
    });

    await expect(readStudioLazyReelResearchRunRequest(request)).resolves.toEqual({
      idempotencyKey: "run-123",
      productId: "product-123",
      request: {
        focus: "apps",
        limit: undefined,
        niche: undefined,
        tool: "niche_report",
      },
    });
  });

  it("rejects an unbounded idempotency key", async () => {
    const request = new Request("https://clipstitchr.test/api/studio/research/runs", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: "x".repeat(161),
        productId: "product-123",
        request: { tool: "get_status" },
      }),
    });

    await expect(readStudioLazyReelResearchRunRequest(request)).rejects.toThrow(
      "Idempotency key is too long",
    );
  });
});
