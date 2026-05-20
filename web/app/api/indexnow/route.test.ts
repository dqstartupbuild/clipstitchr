import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/indexnow/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    createIndexNowPayload: vi.fn(),
    createIndexNowRateLimitKey: vi.fn(),
    getIndexNowPublicSiteUrl: vi.fn(),
    getIndexNowSubmissionUrls: vi.fn(),
    getIsAuthorizedIndexNowRequest: vi.fn(),
    submitIndexNowPayload: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeIndexNowSubmit: "rateLimits.consumeIndexNowSubmit",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createConvexHttpClient",
  () => ({
    createConvexHttpClient: mocks.createConvexHttpClient,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/indexnow/createIndexNowPayload",
  () => ({
    createIndexNowPayload: mocks.createIndexNowPayload,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/indexnow/createIndexNowRateLimitKey",
  () => ({
    createIndexNowRateLimitKey: mocks.createIndexNowRateLimitKey,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/indexnow/getIndexNowPublicSiteUrl",
  () => ({
    getIndexNowPublicSiteUrl: mocks.getIndexNowPublicSiteUrl,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/indexnow/getIndexNowSubmissionUrls",
  () => ({
    getIndexNowSubmissionUrls: mocks.getIndexNowSubmissionUrls,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/indexnow/getIsAuthorizedIndexNowRequest",
  () => ({
    getIsAuthorizedIndexNowRequest: mocks.getIsAuthorizedIndexNowRequest,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/indexnow/submitIndexNowPayload",
  () => ({
    submitIndexNowPayload: mocks.submitIndexNowPayload,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/indexnow", {
    method: "POST",
  });
}

describe("POST /api/indexnow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getIsAuthorizedIndexNowRequest.mockReturnValue(true);
    mocks.getIndexNowPublicSiteUrl.mockReturnValue("https://clipstitchr.com");
    mocks.getIndexNowSubmissionUrls.mockReturnValue([
      "https://clipstitchr.com/",
      "https://clipstitchr.com/blog",
    ]);
    mocks.createIndexNowPayload.mockReturnValue({
      host: "clipstitchr.com",
      key: "indexnow-key",
      keyLocation: "https://clipstitchr.com/indexnow-key.txt",
      urlList: [
        "https://clipstitchr.com/",
        "https://clipstitchr.com/blog",
      ],
    });
    mocks.createIndexNowRateLimitKey.mockReturnValue("indexnow:127.0.0.1");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.submitIndexNowPayload.mockResolvedValue({
      body: "",
      ok: true,
      status: 200,
      statusText: "OK",
    });
  });

  it("returns 401 before building the payload when unauthorized", async () => {
    mocks.getIsAuthorizedIndexNowRequest.mockReturnValue(false);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Unauthorized IndexNow submission request.",
    });
    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
    expect(mocks.submitIndexNowPayload).not.toHaveBeenCalled();
  });

  it("consumes quota before submitting URLs to IndexNow", async () => {
    const request = createRequest();
    const response = await POST(request);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      providerStatus: 200,
      providerStatusText: "OK",
      submittedUrlCount: 2,
      urls: [
        "https://clipstitchr.com/",
        "https://clipstitchr.com/blog",
      ],
    });
    expect(response.status).toBe(200);
    expect(mocks.createIndexNowRateLimitKey).toHaveBeenCalledWith(request);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeIndexNowSubmit,
      {
        key: "indexnow:127.0.0.1",
        secret: "rate-limit-secret",
        urlCount: 2,
      },
    );
    expect(mocks.submitIndexNowPayload).toHaveBeenCalledWith({
      host: "clipstitchr.com",
      key: "indexnow-key",
      keyLocation: "https://clipstitchr.com/indexnow-key.txt",
      urlList: [
        "https://clipstitchr.com/",
        "https://clipstitchr.com/blog",
      ],
    });
  });

  it("returns provider rejection details when IndexNow rejects the payload", async () => {
    mocks.submitIndexNowPayload.mockResolvedValue({
      body: "invalid key",
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "IndexNow rejected the URL submission.",
      providerBody: "invalid key",
      providerStatus: 403,
      providerStatusText: "Forbidden",
      submittedUrlCount: 2,
    });
    expect(response.status).toBe(502);
  });

  it("returns rate-limit responses before contacting IndexNow", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "indexNowSubmit",
        retryAfter: 2000,
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      error: "Rate limit exceeded. Try again in 2 seconds.",
      message: "Rate limit exceeded. Try again in 2 seconds.",
      rateLimit: "indexNowSubmit",
      retryAfter: 2000,
      retryAfterSeconds: 2,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
    expect(mocks.submitIndexNowPayload).not.toHaveBeenCalled();
  });

  it("returns 500 for unexpected submission failures", async () => {
    mocks.submitIndexNowPayload.mockRejectedValue(new Error("network down"));

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "network down",
    });
    expect(response.status).toBe(500);
  });
});
