import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { StudioBetaApiAccessError } from "@/lib/clipstitchr/server/studio/access/StudioBetaApiAccessError";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    assertAccess: vi.fn(),
    convex,
    createClient: vi.fn(() => convex),
    createKey: vi.fn(),
    getSignedUrl: vi.fn(),
    getToken: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioBetaRateLimits: {
      consumeStudioBetaR2Upload: {
        consumeStudioBetaR2Upload: "consume-studio-upload",
      },
    },
  },
}));
vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.assertAccess }),
);
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({ createAuthenticatedConvexHttpClient: mocks.createClient }),
);
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getToken,
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-secret",
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2UploadSignedUrl", () => ({
  getR2UploadSignedUrl: mocks.getSignedUrl,
}));
vi.mock(
  "@/lib/clipstitchr/server/studio/r2/createStudioBetaR2ObjectKey",
  () => ({ createStudioBetaR2ObjectKey: mocks.createKey }),
);

function createRequest() {
  return new Request("https://clipstitchr.test/api/studio/r2/upload-url", {
    method: "POST",
    body: JSON.stringify({
      contentType: "video/mp4",
      kind: "media-source",
      productId: "product_123",
      recordId: "clip_123",
      sizeBytes: 1024,
    }),
  });
}

describe("POST /api/studio/r2/upload-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "user_123" });
    mocks.getToken.mockResolvedValue("convex-token");
    mocks.createKey.mockReturnValue(
      "users/user_123/studio/v1/media-source/product_123/clip_123/file.mp4",
    );
    mocks.getSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/upload",
    });
  });

  it("checks Studio access before reading or signing the upload", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(403));

    const response = await POST(createRequest());

    expect(response.status).toBe(403);
    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });

  it("consumes authenticated Studio quota before signing", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "consume-studio-upload",
      { productId: "product_123", secret: "rate-secret", sizeBytes: 1024 },
    );
    expect(mocks.getSignedUrl).toHaveBeenCalledAfter(mocks.convex.mutation);
    expect(mocks.getSignedUrl).toHaveBeenCalledWith({
      contentType: "video/mp4",
      key: "users/user_123/studio/v1/media-source/product_123/clip_123/file.mp4",
      sizeBytes: 1024,
    });
  });
});
