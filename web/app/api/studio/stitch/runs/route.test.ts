import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaApiAccessError } from "@/lib/clipstitchr/server/studio/access/StudioBetaApiAccessError";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
  createIntent: vi.fn(),
  readRequest: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.assertAccess }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/stitch/createStudioStitchGenerationIntent",
  () => ({ createStudioStitchGenerationIntent: mocks.createIntent }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRunRequest",
  () => ({ readStudioStitchRunRequest: mocks.readRequest }),
);

describe("POST /api/studio/stitch/runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "owner_123" });
    mocks.readRequest.mockResolvedValue({
      id: "run_123",
      productId: "product_123",
      reviewSubsetId: "review_123",
      recipeIds: ["recipe_123"],
      reviewCount: 1,
      idempotencyKey: "request_123",
    });
    mocks.createIntent.mockResolvedValue({
      created: true,
      run: { id: "run_123", status: "intentReady" },
    });
  });

  it("checks private Studio access before reading the bounded request", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(403));

    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(403);
    expect(mocks.readRequest).not.toHaveBeenCalled();
    expect(mocks.createIntent).not.toHaveBeenCalled();
  });

  it("returns a durable intent without starting provider execution", async () => {
    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(200);
    expect(mocks.createIntent).toHaveBeenCalledWith(
      expect.objectContaining({ id: "run_123", productId: "product_123" }),
    );
    await expect(response.json()).resolves.toMatchObject({
      created: true,
      run: { status: "intentReady" },
    });
  });
});
