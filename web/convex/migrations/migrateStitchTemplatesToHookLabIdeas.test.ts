import { beforeEach, describe, expect, it, vi } from "vitest";
import { migrateStitchTemplatesToHookLabIdeas } from "./migrateStitchTemplatesToHookLabIdeas";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

function getHandler() {
  return (migrateStitchTemplatesToHookLabIdeas as unknown as ConvexFunction)
    .handler;
}

describe("migrateStitchTemplatesToHookLabIdeas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips an existing migration key and converts a new template recipe", async () => {
    const existingTemplate = {
      createdAt: "2026-01-01T00:00:00.000Z",
      id: "template_existing",
      ownerId: "owner_1",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const template = {
      createdAt: "2026-02-01T00:00:00.000Z",
      demoClipId: "demo_1",
      demoClipName: "Demo",
      demoPlaybackRate: 2,
      demoTrimRange: { start: 1, end: 5 },
      duration: 12,
      height: 1920,
      id: "template_new",
      includeDemoAudio: true,
      includeUgcAudio: false,
      mode: "normal",
      name: "Morning proof",
      ownerId: "owner_1",
      socialCaption: "Watch this.",
      sourceStitchId: "stitch_1",
      sourceStitchName: "Original Stitch",
      textOverlay: {
        endTime: 8,
        fontSize: 0.05,
        startTime: 0,
        styleId: "hook",
        text: "The proof was in my mornings",
        width: 0.8,
        x: 0.1,
        y: 0.15,
      },
      ugcClipId: "ugc_1",
      ugcClipName: "Opening",
      ugcPlaybackRate: 1,
      ugcTrimRange: { start: 0, end: 7 },
      updatedAt: "2026-02-02T00:00:00.000Z",
      width: 1080,
    };
    const page = {
      continueCursor: "cursor_2",
      isDone: true,
      page: [existingTemplate, template],
    };
    const uniqueValues: Record<string, unknown[]> = {
      hookLabIdeas: [{ id: "already_migrated" }, null],
      stitches: [
        {
          demoQuickEdit: { removeRanges: [] },
          id: "stitch_1",
          music: { trackId: "track_1" },
          productId: "product_1",
          ugcQuickEdit: { removeRanges: [{ start: 2, end: 3 }] },
        },
      ],
      videoClips: [
        { id: "ugc_1", poseDescription: "Creator raises an eyebrow" },
      ],
    };
    const ctx = {
      db: {
        insert: vi.fn(),
        query: vi.fn((table: string) => {
          const indexQuery = { eq: vi.fn(() => indexQuery) };
          const chain = {
            paginate: vi.fn(async () => page),
            unique: vi.fn(async () => uniqueValues[table]?.shift() ?? null),
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

    await expect(
      getHandler()(ctx, {
        paginationOpts: { cursor: null, numItems: 100 },
        secret: "rate-secret",
      }),
    ).resolves.toEqual({
      continueCursor: "cursor_2",
      createdCount: 1,
      isDone: true,
      processedCount: 2,
    });
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "hookLabIdeas",
      expect.objectContaining({
        migrationKey: "template:template_new",
        originalText: "The proof was in my mornings",
        productId: "product_1",
        scope: "product",
        sourceTemplateId: "template_new",
        stitchRecipe: expect.objectContaining({
          demoPlaybackRate: 2,
          music: { trackId: "track_1" },
          socialCaption: "Watch this.",
          ugcQuickEdit: { removeRanges: [{ start: 2, end: 3 }] },
        }),
      }),
    );
  });
});
