import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    assertAccess: vi.fn(),
    convex,
    createClient: vi.fn(() => convex),
    getSignedUrl: vi.fn(),
    getToken: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioBetaRateLimits: {
      consumeStudioBetaR2Download: {
        consumeStudioBetaR2Download: "consume-studio-download",
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
vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getSignedUrl,
}));

function createRequest(key: string) {
  return new Request("https://clipstitchr.test/api/studio/r2/download-url", {
    method: "POST",
    body: JSON.stringify({ key, productId: "product_123" }),
  });
}

describe("POST /api/studio/r2/download-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "user_123" });
    mocks.getToken.mockResolvedValue("convex-token");
    mocks.getSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/download",
    });
  });

  it("rejects a classic or another-owner key before quota or signing", async () => {
    const response = await POST(
      createRequest(
        "users/user_456/studio/v1/project/product_123/project_1/file.json",
      ),
    );

    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });

  it("consumes quota before signing an owner-scoped Studio key", async () => {
    const key =
      "users/user_123/studio/v1/project/product_123/project_1/file.json";
    const response = await POST(createRequest(key));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "consume-studio-download",
      { productId: "product_123", secret: "rate-secret" },
    );
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(key);
    expect(mocks.getSignedUrl).toHaveBeenCalledAfter(mocks.convex.mutation);
  });

  it("rejects another Product under the same owner before quota or signing", async () => {
    const response = await POST(
      createRequest(
        "users/user_123/studio/v1/project/product_456/project_1/file.json",
      ),
    );

    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });
});
