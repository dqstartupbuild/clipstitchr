import { beforeEach, describe, expect, it, vi } from "vitest";
import { submit } from "./waitlist";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  mutation: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(existingEntry: unknown = null) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    unique: vi.fn(async () => existingEntry),
    withIndex: vi.fn((_indexName: string, callback: (q: typeof indexQuery) => void) => {
      callback(indexQuery);

      return chain;
    }),
  };

  return chain;
}

describe("convex waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimiter.limit.mockResolvedValue({ ok: true });
  });

  it("normalizes and inserts new waitlist submissions", async () => {
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_1"),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(
      getHandler(submit)(ctx, {
        email: " Founder@Example.COM ",
        name: "  Ada   Founder  ",
      }),
    ).resolves.toEqual({ status: "created" });
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "waitlistSubmitByEmail",
      { key: "founder@example.com" },
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "waitlistSubmitGlobal",
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "waitlist",
      expect.objectContaining({
        email: "founder@example.com",
        name: "Ada Founder",
        normalizedEmail: "founder@example.com",
        source: "sign-up-page",
      }),
    );
  });

  it("updates existing waitlist submissions", async () => {
    const existingEntry = { _id: "waitlist_1" };
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => createQueryChain(existingEntry)),
      },
    };

    await expect(
      getHandler(submit)(ctx, {
        email: "founder@example.com",
        name: "Ada Founder",
      }),
    ).resolves.toEqual({ status: "updated" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "waitlist_1",
      expect.objectContaining({
        email: "founder@example.com",
        name: "Ada Founder",
      }),
    );
  });

  it("validates name and email before consuming rate limits", async () => {
    const ctx = {
      db: {
        query: vi.fn(),
      },
    };

    await expect(
      getHandler(submit)(ctx, { email: "ada@example.com", name: "A" }),
    ).rejects.toThrow("Enter a name between 2 and 120 characters.");
    await expect(
      getHandler(submit)(ctx, { email: "not-email", name: "Ada" }),
    ).rejects.toThrow("Enter a valid email address.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
  });

  it("rejects submissions when either waitlist rate limit is exceeded", async () => {
    const ctx = {
      db: {
        query: vi.fn(),
      },
    };
    mocks.rateLimiter.limit
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });

    await expect(
      getHandler(submit)(ctx, {
        email: "founder@example.com",
        name: "Ada Founder",
      }),
    ).rejects.toThrow("Too many waitlist submissions. Try again later.");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
