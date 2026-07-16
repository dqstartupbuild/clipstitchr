import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "./route";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    deleteR2Object: vi.fn(),
    deleteR2Objects: vi.fn(),
    fetch: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2DownloadSignedUrl: vi.fn(),
    putR2Object: vi.fn(),
    waitForProviderJob: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    providerJobs: { create: "providerJobs.create" },
    rateLimits: {
      consumeR2Download: "rateLimits.consumeR2Download",
      consumeR2Upload: "rateLimits.consumeR2Upload",
      consumeSwaprPhotoExpand: "rateLimits.consumeSwaprPhotoExpand",
    },
    usage: {
      cancelUsageReservation: {
        cancelUsageReservation: "usage.cancelUsageReservation",
      },
      reserveCreationCredits: {
        reserveCreationCredits: "usage.reserveCreationCredits",
      },
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient:
      mocks.createAuthenticatedConvexHttpClient,
  }),
);
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));
vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));
vi.mock("@/lib/clipstitchr/server/r2/deleteR2Object", () => ({
  deleteR2Object: mocks.deleteR2Object,
}));
vi.mock("@/lib/clipstitchr/server/r2/deleteR2Objects", () => ({
  deleteR2Objects: mocks.deleteR2Objects,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));
vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));
vi.mock("@/lib/clipstitchr/server/waitForProviderJob", () => ({
  waitForProviderJob: mocks.waitForProviderJob,
}));
vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest() {
  const formData = new FormData();

  formData.set(
    "image",
    new File(["image"], "image.jpg", { type: "image/jpeg" }),
  );
  formData.set("mask", new File(["mask"], "mask.png", { type: "image/png" }));
  formData.set("prompt", "extend the studio");

  return new Request("https://clipstitchr.test/api/swapr/photos/expand", {
    body: formData,
    method: "POST",
  });
}

describe("POST /api/swapr/photos/expand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.deleteR2Object.mockResolvedValue(undefined);
    mocks.deleteR2Objects.mockResolvedValue(undefined);
    mocks.createId.mockReturnValue("expansion_1");
    mocks.convex.mutation.mockImplementation(async (mutationId: string) => {
      if (mutationId === "usage.reserveCreationCredits") {
        return { planKey: "pro", reservationId: "reservation_1" };
      }

      return null;
    });
    mocks.putR2Object
      .mockResolvedValueOnce({
        contentType: "image/jpeg",
        key: "users/user_123/provider-input/image.jpg",
        size: 5,
      })
      .mockResolvedValueOnce({
        contentType: "image/png",
        key: "users/user_123/provider-input/mask.png",
        size: 4,
      });
    mocks.waitForProviderJob.mockResolvedValue({
      outputAssetIds: ["users/user_123/provider-output/expanded.jpg"],
    });
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      url: "https://r2.example/expanded.jpg",
    });
    mocks.fetch.mockResolvedValue(
      new Response("expanded", {
        headers: { "content-type": "image/jpeg" },
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
  });

  it("uploads inputs, queues the expansion, and downloads its output", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("expanded");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.objectContaining({
        jobType: "swapr-photo-expansion",
        usageReservationId: "reservation_1",
      }),
    );
    expect(mocks.waitForProviderJob).toHaveBeenCalledWith(
      mocks.convex,
      "provider:swapr-photo-expansion:expansion_1",
    );
    expect(mocks.deleteR2Object).toHaveBeenCalledWith(
      "users/user_123/provider-output/expanded.jpg",
    );
  });

  it("returns worker failures", async () => {
    mocks.waitForProviderJob.mockRejectedValue(new Error("provider failed"));

    const response = await POST(createRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "provider failed",
    });
  });

  it("returns rate limits before reserving or uploading", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swaprPhotoExpand",
        retryAfter: 1200,
      },
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(429);
    expect(mocks.putR2Object).not.toHaveBeenCalled();
  });
});
