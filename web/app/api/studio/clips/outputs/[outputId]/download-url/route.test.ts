import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  convex: { mutation: vi.fn(), query: vi.fn() },
  getAuthenticatedClient: vi.fn(),
  getSignedUrl: vi.fn(),
  readRequest: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioBetaRateLimits: {
      consumeStudioBetaR2Download: {
        consumeStudioBetaR2Download: "consume-download",
      },
    },
    studioClipsOutputs: { getOwned: { getOwned: "get-output" } },
    studioClipsRateLimits: {
      reserveStaticRead: { reserveStaticRead: "reserve-read" },
    },
  },
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-secret",
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getSignedUrl,
}));
vi.mock("../../../_lib/getStudioClipsAuthenticatedClient", () => ({
  getStudioClipsAuthenticatedClient: mocks.getAuthenticatedClient,
}));
vi.mock("../../../_lib/readStudioClipsOutputAccessRequest", () => ({
  readStudioClipsOutputAccessRequest: mocks.readRequest,
}));

describe("Studio Clips output download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedClient.mockResolvedValue({
      convex: mocks.convex,
      userId: "user_1",
    });
    mocks.readRequest.mockResolvedValue({
      productId: "product_1",
      taskId: "task_1",
    });
    mocks.getSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/download",
    });
  });

  it("rejects a poisoned cross-Product key before download quota or signing", async () => {
    mocks.convex.query.mockResolvedValue({
      objectKey:
        "users/user_1/studio/v1/studio-clips/product_2/task_1/clip_1/clip.mp4",
      taskId: "task_1",
    });

    const response = await POST(new Request("https://clipstitchr.test"), {
      params: Promise.resolve({ outputId: "output_1" }),
    });

    expect(response.status).toBe(400);
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).toHaveBeenCalledTimes(1);
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      "consume-download",
      expect.anything(),
    );
  });

  it("uses a render revision ID as the immutable worker namespace", async () => {
    const objectKey =
      "users/user_1/studio/v1/studio-clips/product_1/revision_1/clip_1/clip.mp4";
    mocks.convex.query.mockResolvedValue({
      objectKey,
      renderRevisionId: "revision_1",
      taskId: "task_1",
    });

    const response = await POST(new Request("https://clipstitchr.test"), {
      params: Promise.resolve({ outputId: "output_1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(objectKey);
    expect(mocks.convex.mutation).toHaveBeenCalledWith("consume-download", {
      productId: "product_1",
      secret: "rate-secret",
    });
  });
});
