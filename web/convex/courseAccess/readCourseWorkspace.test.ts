import { beforeEach, describe, expect, it, vi } from "vitest";
import { readCourseWorkspace } from "./readCourseWorkspace";

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

describe("course workspace reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ ok: true });
  });

  it("returns released progress without contact or session details", async () => {
    mocks.getCourseWorkspaceAccess.mockResolvedValue({
      entitlement: { _id: "entitlement_1", activatedAt: 500 },
      releasedSectionCount: 2,
    });
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const chain = {
      collect: vi.fn(async () => [
        {
          completed: true,
          itemId: "l1-exercise",
          note: "Answer",
          updatedAt: 900,
        },
      ]),
      withIndex: vi.fn((_name, callback) => {
        callback(indexQuery);
        return chain;
      }),
    };
    const ctx = { db: { query: vi.fn(() => chain) } };

    const result = await getHandler(readCourseWorkspace)(ctx, {
      accessedAt: 1_000,
      courseKey: "ugc-to-app-ad-mini-course",
      secret: "secret",
      sessionTokenHash: "b".repeat(64),
    });

    expect(result).toEqual({
      activatedAt: 500,
      availableSectionCount: 2,
      hasAccess: true,
      hasSession: true,
      progressItems: [
        {
          completed: true,
          itemId: "l1-exercise",
          note: "Answer",
          updatedAt: 900,
        },
      ],
    });
    expect(JSON.stringify(result)).not.toMatch(/email|token|contact/i);
  });

  it("does not imply course access from a contact-wide session alone", async () => {
    mocks.getCourseWorkspaceAccess.mockResolvedValue({
      entitlement: null,
      releasedSectionCount: 0,
    });
    const ctx = { db: { query: vi.fn() } };

    await expect(
      getHandler(readCourseWorkspace)(ctx, {
        accessedAt: 1_000,
        courseKey: "five-day-app-content-sprint",
        secret: "secret",
        sessionTokenHash: "b".repeat(64),
      }),
    ).resolves.toEqual({
      availableSectionCount: 0,
      hasAccess: false,
      hasSession: true,
      progressItems: [],
    });
  });
});
