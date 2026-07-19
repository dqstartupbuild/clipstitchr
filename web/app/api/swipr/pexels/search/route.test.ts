import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/pexels/search/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    searchPexelsPhotoResults: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumePexelsSearch: "rateLimits.consumePexelsSearch",
    },
    swiprBackgrounds: {
      getExistingPexelsPhotoIds: "swiprBackgrounds.getExistingPexelsPhotoIds",
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

vi.mock("@/lib/clipstitchr/server/pexels/searchPexelsPhotoResults", () => ({
  searchPexelsPhotoResults: mocks.searchPexelsPhotoResults,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/swipr/pexels/search", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createPhoto(id: number) {
  return {
    alt: "A desk setup",
    height: 1920,
    id,
    photographer: "Avery",
    photographerUrl: "https://pexels.com/@avery",
    pexelsUrl: `https://pexels.com/photo/${id}`,
    src: {
      large: "https://images.pexels.com/large.jpg",
      large2x: "https://images.pexels.com/large2x.jpg",
      medium: "https://images.pexels.com/medium.jpg",
      original: "https://images.pexels.com/original.jpg",
      portrait: "https://images.pexels.com/portrait.jpg",
      small: "https://images.pexels.com/small.jpg",
    },
    width: 1080,
  };
}

describe("POST /api/swipr/pexels/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.query.mockResolvedValue([]);
    mocks.searchPexelsPhotoResults.mockResolvedValue([createPhoto(101)]);
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ query: "desk setup" }));

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("searches the requested Pexels page after consuming search quota", async () => {
    const response = await POST(
      createRequest({ page: 2, perPage: 12, query: " desk setup " }),
    );

    await expect(response.json()).resolves.toEqual({
      hasMore: false,
      page: 2,
      perPage: 12,
      photos: [createPhoto(101)],
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumePexelsSearch,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.searchPexelsPhotoResults).toHaveBeenCalledWith({
      page: 2,
      perPage: 12,
      query: "desk setup",
    });
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swiprBackgrounds.getExistingPexelsPhotoIds,
      { photoIds: [101] },
    );
  });

  it("removes photos that already exist in a saved pack", async () => {
    mocks.searchPexelsPhotoResults.mockResolvedValue([
      createPhoto(101),
      createPhoto(102),
    ]);
    mocks.convex.query.mockResolvedValue([101]);

    const response = await POST(createRequest({ query: "desk setup" }));

    await expect(response.json()).resolves.toEqual({
      hasMore: false,
      page: 1,
      perPage: 12,
      photos: [createPhoto(102)],
    });
  });

  it("returns rate-limit responses before searching Pexels", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "pexelsSearch",
        retryAfter: 2000,
      },
    });

    const response = await POST(createRequest({ query: "desk setup" }));

    expect(response.status).toBe(429);
    expect(mocks.searchPexelsPhotoResults).not.toHaveBeenCalled();
  });
});
