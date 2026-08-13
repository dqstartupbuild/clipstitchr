import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSources } from "./listSources";

type ConvexFunction = {
  handler: (ctx: never, args: never) => Promise<unknown>;
};
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  access: vi.fn(),
  product: vi.fn(),
  consume: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));
vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.access,
}));
vi.mock("../studioEditorProjects/assertStudioEditorActiveProduct", () => ({
  assertStudioEditorActiveProduct: mocks.product,
}));
vi.mock(
  "../studioEditorRateLimits/consumeStudioEditorStaticReadRateLimits",
  () => ({ consumeStudioEditorStaticReadRateLimits: mocks.consume }),
);

function createQuery(result: unknown[]) {
  const query = {
    withIndex: vi.fn(),
    order: vi.fn(),
    take: vi.fn().mockResolvedValue(result),
  };
  query.withIndex.mockImplementation((_name, apply) => {
    const index = { eq: vi.fn() };
    index.eq.mockReturnValue(index);
    apply(index);
    return query;
  });
  query.order.mockReturnValue(query);
  return query;
}

describe("studioEditorMedia.listSources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
  });

  it("reserves owner/global read capacity before returning durable source descriptors", async () => {
    const videoQuery = createQuery([
      {
        id: "clip_1",
        name: "UGC",
        duration: 5,
        width: 1080,
        height: 1920,
        hasAudio: true,
        videoObject: { key: "clips/clip.mp4" },
        posterObject: { key: "posters/clip.jpg" },
      },
    ]);
    const stitchQuery = createQuery([
      {
        id: "stitch_1",
        name: "Stitch",
        duration: 9,
        width: 1080,
        height: 1920,
        includeDemoAudio: false,
        includeUgcAudio: false,
        music: undefined,
        stitchObject: { key: "stitches/stitch.mp4" },
        posterObject: { key: "posters/stitch.jpg" },
      },
      {
        id: "pending_stitch",
        name: "Pending",
        duration: 1,
        width: 1,
        height: 1,
      },
    ]);
    const ctx = {
      db: {
        query: vi.fn((table: string) =>
          table === "videoClipCards" ? videoQuery : stitchQuery,
        ),
      },
    };
    const handler = (listSources as unknown as ConvexFunction).handler;
    await expect(
      handler(
        ctx as never,
        { productId: "product_1", limitPerKind: 500 } as never,
      ),
    ).resolves.toEqual({
      videoClips: [
        {
          kind: "videoClip",
          id: "clip_1",
          name: "UGC",
          durationSeconds: 5,
          width: 1080,
          height: 1920,
          hasAudio: true,
          objectKey: "clips/clip.mp4",
          posterKey: "posters/clip.jpg",
        },
      ],
      stitches: [
        {
          kind: "stitch",
          id: "stitch_1",
          name: "Stitch",
          durationSeconds: 9,
          width: 1080,
          height: 1920,
          hasAudio: false,
          objectKey: "stitches/stitch.mp4",
          posterKey: "posters/stitch.jpg",
        },
      ],
    });
    expect(mocks.consume).toHaveBeenCalledWith(ctx, "owner_1");
    expect(videoQuery.take).toHaveBeenCalledWith(50);
    expect(stitchQuery.take).toHaveBeenCalledWith(50);
    expect(mocks.consume.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.db.query.mock.invocationCallOrder[0],
    );
  });

  it("does not reserve or query when Studio access is denied", async () => {
    mocks.access.mockRejectedValue(new Error("Studio Beta access denied."));
    const ctx = { db: { query: vi.fn() } };
    const handler = (listSources as unknown as ConvexFunction).handler;
    await expect(
      handler(ctx as never, { productId: "product_1" } as never),
    ).rejects.toThrow("access denied");
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
