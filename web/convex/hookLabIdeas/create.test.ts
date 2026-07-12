import { beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "./create";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));

function getHandler() {
  return (create as unknown as ConvexFunction).handler;
}

function createCtx(values: Record<string, unknown[]> = {}) {
  const queues = Object.fromEntries(
    Object.entries(values).map(([table, entries]) => [table, [...entries]]),
  ) as Record<string, unknown[]>;

  return {
    db: {
      insert: vi.fn(async () => "idea_doc"),
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
          unique: vi.fn(async () => queues[table]?.shift() ?? null),
          withIndex: vi.fn(
            (_index: string, callback: (query: typeof indexQuery) => unknown) => {
              callback(indexQuery);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };
}

const createdAt = "2026-07-12T12:00:00.000Z";

describe("hookLabIdeas.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("returns the owner's existing request without consuming save quota", async () => {
    const existing = { id: "idea_existing", ownerId: "owner_1" };
    const ctx = createCtx({ hookLabIdeas: [existing] });

    await expect(
      getHandler()(ctx, {
        createdAt,
        id: "idea_new",
        originalText: "A hook",
        requestKey: "request_1",
        scope: "shared",
        sourceType: "text",
      }),
    ).resolves.toBe(existing);
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects a product outside the authenticated owner's indexed scope", async () => {
    const ctx = createCtx({ hookLabIdeas: [null], products: [null] });

    await expect(
      getHandler()(ctx, {
        createdAt,
        id: "idea_new",
        originalText: "A hook",
        productId: "product_other",
        requestKey: "request_2",
        scope: "product",
        sourceType: "text",
      }),
    ).rejects.toThrow("Choose one of your products");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("copies the generated hook and its finished Stitch recipe into the idea", async () => {
    const option = {
      _id: "option_doc",
      angle: "Relief",
      hook: "The morning shortcut I needed",
      id: "option_1",
      planId: "plan_1",
      productId: "product_1",
      stitchId: "stitch_1",
    };
    const stitch = {
      _id: "stitch_doc",
      demoClipId: "demo_1",
      demoClipName: "Demo",
      demoPlaybackRate: 2,
      demoTrimRange: { start: 1, end: 5 },
      duration: 12,
      height: 1920,
      id: "stitch_1",
      includeDemoAudio: true,
      includeUgcAudio: false,
      mode: "normal",
      productId: "product_1",
      socialCaption: "See the difference.",
      textOverlay: {
        endTime: 8,
        fontSize: 0.05,
        startTime: 0,
        styleId: "hook",
        text: option.hook,
        width: 0.8,
        x: 0.1,
        y: 0.15,
      },
      ugcClipId: "ugc_1",
      ugcClipName: "Opening",
      ugcPlaybackRate: 1,
      ugcTrimRange: { start: 0, end: 7 },
      width: 1080,
    };
    const ctx = createCtx({
      hookLabIdeas: [null, null],
      stitchrHookOptions: [option, option],
      stitches: [stitch],
    });

    const result = await getHandler()(ctx, {
      createdAt,
      id: "idea_generated",
      requestKey: "request_generated",
      scope: "product",
      sourceHookOptionId: option.id,
      sourceType: "generated_hook",
    });

    expect(result).toEqual(
      expect.objectContaining({
        originalText: option.hook,
        productId: "product_1",
        sourceHookOptionId: option.id,
        sourceStitchId: stitch.id,
        stitchRecipe: expect.objectContaining({
          demoClipId: "demo_1",
          demoPlaybackRate: 2,
          socialCaption: "See the difference.",
          ugcClipId: "ugc_1",
          ugcTrimRange: { start: 0, end: 7 },
        }),
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "option_doc",
      expect.objectContaining({
        linkedIdeaId: "idea_generated",
        reviewState: "saved",
      }),
    );
  });
});
