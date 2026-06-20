import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/pexels/import/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    downloadPexelsPhotoBytes: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    putR2Object: vi.fn(),
    readImageDimensionsFromBytes: vi.fn(),
    searchPexelsPhotoResults: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumePexelsImport: "rateLimits.consumePexelsImport",
      consumePexelsSearch: "rateLimits.consumePexelsSearch",
    },
    swiprBackgrounds: {
      addLibraryPackToAccount: "swiprBackgrounds.addLibraryPackToAccount",
      getExistingPexelsPhotoIds: "swiprBackgrounds.getExistingPexelsPhotoIds",
      save: "swiprBackgrounds.save",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/pexels/downloadPexelsPhotoBytes", () => ({
  downloadPexelsPhotoBytes: mocks.downloadPexelsPhotoBytes,
}));

vi.mock("@/lib/clipstitchr/server/pexels/searchPexelsPhotoResults", () => ({
  searchPexelsPhotoResults: mocks.searchPexelsPhotoResults,
}));

vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));

vi.mock("@/lib/clipstitchr/server/readImageDimensionsFromBytes", () => ({
  readImageDimensionsFromBytes: mocks.readImageDimensionsFromBytes,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/swipr/pexels/import", {
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

describe("POST /api/swipr/pexels/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.query.mockResolvedValue([]);
    mocks.createId
      .mockReturnValueOnce("background_1")
      .mockReturnValueOnce("background_2");
    mocks.searchPexelsPhotoResults.mockResolvedValue([
      createPhoto(101),
      createPhoto(102),
    ]);
    mocks.downloadPexelsPhotoBytes.mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      contentType: "image/jpeg",
    });
    mocks.readImageDimensionsFromBytes.mockReturnValue({
      height: 1920,
      width: 1080,
    });
    mocks.putR2Object.mockImplementation(({ key }) =>
      Promise.resolve({
        contentType: "image/jpeg",
        key,
        size: 3,
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ query: "desk setup" }));

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("searches Pexels, uploads images to R2, and saves query-pack records", async () => {
    const response = await POST(
      createRequest({ count: 2, page: 3, query: " desk setup " }),
    );

    await expect(response.json()).resolves.toEqual({
      ids: ["background_1", "background_2"],
      imported: 2,
      importedPexelsPhotoIds: [101, 102],
      page: 3,
      query: "desk setup",
      searched: 2,
      skipped: 0,
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumePexelsSearch,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumePexelsImport,
      { count: 2, secret: "rate-limit-secret" },
    );
    expect(mocks.searchPexelsPhotoResults).toHaveBeenCalledWith({
      page: 3,
      perPage: 2,
      query: "desk setup",
    });
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swiprBackgrounds.getExistingPexelsPhotoIds,
      { photoIds: [101, 102] },
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/jpeg",
        key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.swiprBackgrounds.save,
      expect.objectContaining({
        id: "background_1",
        libraryQuery: "desk setup",
        pexelsPhotoId: 101,
        source: "pexels",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.swiprBackgrounds.addLibraryPackToAccount,
      { libraryQuery: "desk setup" },
    );
  });

  it("imports the loaded Pexels photos without searching again", async () => {
    const response = await POST(
      createRequest({
        photos: [createPhoto(101), createPhoto(102)],
        query: " desk setup ",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      ids: ["background_1", "background_2"],
      imported: 2,
      importedPexelsPhotoIds: [101, 102],
      page: 1,
      query: "desk setup",
      searched: 2,
      skipped: 0,
    });
    expect(response.status).toBe(200);
    expect(mocks.searchPexelsPhotoResults).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumePexelsSearch,
      expect.anything(),
    );
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swiprBackgrounds.getExistingPexelsPhotoIds,
      { photoIds: [101, 102] },
    );
  });

  it("reuses existing pack names and skips already imported photos", async () => {
    mocks.convex.query.mockResolvedValue([101]);

    const response = await POST(
      createRequest({
        photos: [createPhoto(101), createPhoto(102)],
        query: " desk   setup ",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      ids: ["background_1"],
      imported: 1,
      importedPexelsPhotoIds: [102],
      page: 1,
      query: "desk setup",
      searched: 2,
      skipped: 1,
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumePexelsImport,
      { count: 1, secret: "rate-limit-secret" },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.swiprBackgrounds.save,
      expect.objectContaining({
        id: "background_1",
        libraryQuery: "desk setup",
        pexelsPhotoId: 102,
      }),
    );
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
