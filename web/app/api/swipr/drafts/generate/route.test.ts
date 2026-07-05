import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/drafts/generate/route";
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
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    createSwiprBatchTextGeneration: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: {
      get: "products.get",
    },
    rateLimits: {
      consumeCliprHookScript: "rateLimits.consumeCliprHookScript",
    },
    swipes: {
      save: "swipes.save",
    },
    swiprBackgrounds: {
      listByLibraryQueryKeys: "swiprBackgrounds.listByLibraryQueryKeys",
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

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/createSwiprBatchTextGeneration", () => ({
  createSwiprBatchTextGeneration: mocks.createSwiprBatchTextGeneration,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/swipr/drafts/generate", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createProductDocument() {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-01-01T00:00:00.000Z",
    emotionalNarrative: "Move fast without messy launch work.",
    id: "product_1",
    inferredPainPoints: ["launches take too long"],
    inferredProblem: "launch work feels scattered",
    name: "Launch Kit",
    productDetails: "AI launch planner",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function createBackground(id: string, libraryQuery: string) {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    height: 1920,
    id,
    imageObject: {
      contentType: "image/jpeg",
      key: `users/user_123/swipr-backgrounds/${id}/image.jpg`,
      size: 100,
    },
    libraryQuery,
    mimeType: "image/jpeg",
    name: id,
    size: 100,
    source: "pexels",
    tags: ["swipr"],
    width: 1080,
  };
}

describe("POST /api/swipr/drafts/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.query.mockImplementation((query) => {
      if (query === api.products.get) {
        return Promise.resolve(createProductDocument());
      }

      return Promise.resolve([
        createBackground("background_1", "desk setup"),
        createBackground("background_2", "desk setup"),
      ]);
    });
    const createdIds = [
      "slide_1",
      "slide_2",
      "slide_3",
      "slide_4",
      "slide_5",
      "slide_6",
      "slide_7",
      "slide_8",
      "swipe_1",
    ];
    let nextIdIndex = 0;

    mocks.createId.mockImplementation(
      () => createdIds[nextIdIndex++] ?? `generated_${nextIdIndex}`,
    );
    mocks.createSwiprBatchTextGeneration.mockResolvedValue({
      providerModel: "text-model",
      providerPredictionId: "prediction_1",
      slideshows: [
        {
          caption: "caption",
          description: "Long post description",
          hashtags: ["#launch"],
          hook: "Hook",
          rationale: "rationale",
          slides: [
            "Stop messy launches",
            "Try this instead",
            "Pick one clear owner",
            "Use tiny launch lists",
            "Ship before it feels perfect",
            "Save proof as you go",
            "Repeat what worked",
            "Save this launch checklist",
          ],
          socialCaption: "caption\n\nLong post description\n\n#launch",
        },
      ],
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ productId: "product_1" }));

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("generates saved draft Swipes from selected Pexels library queries", async () => {
    const response = await POST(
      createRequest({
        count: 1,
        productId: " product_1 ",
        selectedLibraryQueries: ["desk setup"],
        slideCount: 2,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      count: 1,
      ids: ["swipe_1"],
      providerModel: "text-model",
      providerPredictionId: "prediction_1",
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprHookScript,
      { count: 10, secret: "rate-limit-secret" },
    );
    expect(mocks.createSwiprBatchTextGeneration).toHaveBeenCalledWith({
      count: 10,
      product: expect.objectContaining({ id: "product_1", name: "Launch Kit" }),
      replicate: { provider: "replicate" },
      slideCount: 8,
    });
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swiprBackgrounds.listByLibraryQueryKeys,
      { libraryQueryKeys: ["desk setup"] },
    );
    const saveCall = mocks.convex.mutation.mock.calls.find(([mutation]) => {
      return mutation === api.swipes.save;
    });
    const savedSwipe = saveCall?.[1] as {
      backgroundId: string;
      slides: Array<{ backgroundId: string; id: string }>;
    };

    expect(saveCall).toBeDefined();
    expect(savedSwipe).toEqual(
      expect.objectContaining({
        caption: "caption",
        description: "Long post description",
        hashtags: ["#launch"],
        id: "swipe_1",
        productSourceId: "product_1",
        rationale: "rationale",
        socialCaption: "caption\n\nLong post description\n\n#launch",
      }),
    );
    expect(savedSwipe.backgroundId).toBe(savedSwipe.slides[0]?.backgroundId);
    expect(savedSwipe.slides.map((slide) => slide.id)).toEqual(
      Array.from({ length: 8 }, (_, index) => `slide_${index + 1}`),
    );
    expect(new Set(savedSwipe.slides.map((slide) => slide.backgroundId))).toEqual(
      new Set(["background_1", "background_2"]),
    );
    expect(
      savedSwipe.slides.every((slide, index) => {
        return (
          index === 0 ||
          slide.backgroundId !== savedSwipe.slides[index - 1]?.backgroundId
        );
      }),
    ).toBe(true);
  });

  it("spreads draft preview backgrounds across the generated batch", async () => {
    mocks.convex.query.mockImplementation((query) => {
      if (query === api.products.get) {
        return Promise.resolve(createProductDocument());
      }

      return Promise.resolve([
        createBackground("background_1", "desk setup"),
        createBackground("background_2", "desk setup"),
        createBackground("background_3", "desk setup"),
      ]);
    });
    mocks.createSwiprBatchTextGeneration.mockResolvedValue({
      providerModel: "text-model",
      providerPredictionId: "prediction_1",
      slideshows: Array.from({ length: 3 }, (_, index) => ({
        caption: `caption ${index + 1}`,
        description: `Long post description ${index + 1}`,
        hashtags: ["#launch"],
        hook: `Hook ${index + 1}`,
        rationale: `rationale ${index + 1}`,
        slides: [
          "Stop messy launches",
          "Try this instead",
          "Pick one clear owner",
          "Use tiny launch lists",
          "Ship before it feels perfect",
          "Save proof as you go",
          "Repeat what worked",
          "Save this launch checklist",
        ],
        socialCaption: `caption ${index + 1}\n\nLong post description ${
          index + 1
        }\n\n#launch`,
      })),
    });

    const response = await POST(
      createRequest({
        productId: "product_1",
        selectedLibraryQueries: ["desk setup"],
      }),
    );
    const savedSwipes = mocks.convex.mutation.mock.calls
      .filter(([mutation]) => {
        return mutation === api.swipes.save;
      })
      .map(([, payload]) => {
        return payload as {
          backgroundId: string;
          slides: Array<{ backgroundId: string }>;
        };
      });

    expect(response.status).toBe(200);
    expect(savedSwipes).toHaveLength(3);
    expect(new Set(savedSwipes.map((swipe) => swipe.backgroundId)).size).toBe(3);
    expect(
      savedSwipes.every((swipe) => {
        return swipe.backgroundId === swipe.slides[0]?.backgroundId;
      }),
    ).toBe(true);
  });

  it("requires imported Pexels library backgrounds before provider generation", async () => {
    mocks.convex.query.mockImplementation((query) => {
      if (query === api.products.get) {
        return Promise.resolve(createProductDocument());
      }

      return Promise.resolve([]);
    });

    const response = await POST(
      createRequest({
        productId: "product_1",
        selectedLibraryQueries: ["desk setup"],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Import Pexels photos before generating draft Swipes.",
    });
    expect(response.status).toBe(400);
    expect(mocks.createSwiprBatchTextGeneration).not.toHaveBeenCalled();
  });

  it("requires at least one selected Pexels pack", async () => {
    const response = await POST(createRequest({ productId: "product_1" }));

    await expect(response.json()).resolves.toEqual({
      message: "Choose at least one Pexels pack before generating draft Swipes.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprHookScript,
      expect.anything(),
    );
  });

  it("returns counted rate-limit responses before product lookup", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliprHookScript",
        retryAfter: 1000,
      },
    });

    const response = await POST(
      createRequest({
        count: 2,
        productId: "product_1",
        selectedLibraryQueries: ["desk setup"],
      }),
    );

    expect(response.status).toBe(429);
    expect(mocks.convex.query).not.toHaveBeenCalled();
  });
});
