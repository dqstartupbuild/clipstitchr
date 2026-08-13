import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPending } from "./createPending";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activeProduct: vi.fn(),
  assertAccess: vi.fn(),
  auth: vi.fn(),
  consumeLimits: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.assertAccess,
}));
vi.mock("../studioLazyReel/assertStudioLazyReelActiveProduct", () => ({
  assertStudioLazyReelActiveProduct: mocks.activeProduct,
}));
vi.mock("../studioLazyReel/consumeStudioLazyReelRunCreateRateLimits", () => ({
  consumeStudioLazyReelRunCreateRateLimits: mocks.consumeLimits,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(existing: unknown = null) {
  const query = {
    unique: vi.fn().mockResolvedValue(existing),
    withIndex: vi.fn(),
  };
  query.withIndex.mockImplementation(
    (_name: string, applyIndex: (value: { eq: ReturnType<typeof vi.fn> }) => void) => {
      const index = { eq: vi.fn() };
      index.eq.mockReturnValue(index);
      applyIndex(index);
      return query;
    },
  );
  const inserted = {
    _id: "run_doc",
    ownerId: "owner_1",
    productId: "product_1",
    id: "run_1",
    status: "pending",
  };

  return {
    db: {
      get: vi.fn().mockResolvedValue(inserted),
      insert: vi.fn().mockResolvedValue("run_doc"),
      query: vi.fn(() => query),
    },
  };
}

const args = {
  id: "run_1",
  productId: "product_1",
  idempotencyKey: "request_1",
  identity: { kind: "tool" as const, key: "niche_report" as const },
  sourceSnapshotVersion: "lazyreel-v1",
  inputSnapshot: { schemaVersion: "input.v1", payloadJson: '{"niche":"pets"}' },
};

describe("studioLazyReelResearchRuns.createPending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.assertAccess.mockResolvedValue({ hasAccess: true });
  });

  it("denies access before Product lookup, limits, or persistence", async () => {
    mocks.assertAccess.mockRejectedValue(new Error("Studio Beta access denied."));
    const ctx = createContext();

    await expect(getHandler(createPending)(ctx, args)).rejects.toThrow(
      "Studio Beta access denied",
    );
    expect(mocks.activeProduct).not.toHaveBeenCalled();
    expect(mocks.consumeLimits).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("returns an idempotent matching run without consuming another limit", async () => {
    const existing = {
      _id: "run_doc",
      id: "run_1",
      idempotencyKey: "request_1",
      identity: args.identity,
      sourceSnapshotVersion: "lazyreel-v1",
      inputSnapshot: {
        schemaVersion: "input.v1",
        payloadJson: '{"niche":"pets"}',
      },
    };
    const ctx = createContext(existing);

    await expect(getHandler(createPending)(ctx, args)).resolves.toEqual({
      created: false,
      run: existing,
    });
    expect(mocks.consumeLimits).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("consumes owner and global limits before inserting a new pending run", async () => {
    const ctx = createContext();

    await expect(getHandler(createPending)(ctx, args)).resolves.toMatchObject({
      created: true,
      run: { status: "pending" },
    });
    expect(mocks.activeProduct).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "product_1",
    );
    expect(mocks.consumeLimits).toHaveBeenCalledWith(ctx, "owner_1");
    expect(mocks.consumeLimits.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.db.insert.mock.invocationCallOrder[0],
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioLazyReelResearchRuns",
      expect.objectContaining({
        ownerId: "owner_1",
        productId: "product_1",
        status: "pending",
        recordVersion: 1,
      }),
    );
  });

  it("does not insert when the run budget is exhausted", async () => {
    mocks.consumeLimits.mockRejectedValueOnce(new Error("Rate limit exceeded"));
    const ctx = createContext();

    await expect(getHandler(createPending)(ctx, args)).rejects.toThrow(
      "Rate limit exceeded",
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
