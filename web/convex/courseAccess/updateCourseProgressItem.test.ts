import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateCourseProgressItem } from "./updateCourseProgressItem";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getCourseWorkspaceAccess: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: vi.fn(),
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.rateLimit },
}));
vi.mock("./getCourseWorkspaceAccess", () => ({
  getCourseWorkspaceAccess: mocks.getCourseWorkspaceAccess,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(existing: unknown = null) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const chain = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return chain;
    }),
  };

  return {
    db: {
      insert: vi.fn(async () => "progress_1"),
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

const baseArgs = {
  clientKey: "a".repeat(64),
  completed: true,
  courseKey: "ugc-to-app-ad-mini-course" as const,
  itemId: "l1-exercise",
  note: "  My working answer  ",
  secret: "secret",
  sessionTokenHash: "b".repeat(64),
  updatedAt: 1_000,
};

describe("course progress writes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ ok: true });
    mocks.getCourseWorkspaceAccess.mockResolvedValue({
      entitlement: { _id: "entitlement_1" },
      releasedSectionCount: 1,
    });
  });

  it("stores only the released item state and bounded note", async () => {
    const ctx = createContext();

    await expect(
      getHandler(updateCourseProgressItem)(ctx, baseArgs),
    ).resolves.toEqual({ accepted: true, saved: true });
    expect(ctx.db.insert).toHaveBeenCalledWith("courseProgressItems", {
      completed: true,
      entitlementId: "entitlement_1",
      itemId: "l1-exercise",
      note: "My working answer",
      updatedAt: 1_000,
    });
    expect(JSON.stringify(ctx.db.insert.mock.calls)).not.toMatch(
      /email|token|contact/i,
    );
  });

  it("refuses a valid item from a lesson that has not opened", async () => {
    const ctx = createContext();

    await expect(
      getHandler(updateCourseProgressItem)(ctx, {
        ...baseArgs,
        itemId: "l2-exercise",
      }),
    ).resolves.toEqual({ accepted: true, saved: false });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
