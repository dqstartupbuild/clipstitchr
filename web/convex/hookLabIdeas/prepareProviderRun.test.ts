import { beforeEach, describe, expect, it, vi } from "vitest";
import { prepareProviderRun } from "./prepareProviderRun";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

function getHandler() {
  return (prepareProviderRun as unknown as ConvexFunction).handler;
}

function createContext(idea: Record<string, unknown>) {
  const index = { eq: vi.fn() };
  index.eq.mockReturnValue(index);
  const chain = {
    unique: vi.fn(async () => idea),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => unknown) => {
      callback(index);
      return chain;
      },
    ),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("hookLabIdeas.prepareProviderRun", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records an at-most-once start marker before the paid call", async () => {
    const ctx = createContext({
      _id: "idea-document",
      id: "idea-1",
      sourceType: "social_link",
    });

    await expect(
      getHandler()(ctx, {
        id: "idea-1",
        ownerId: "owner-1",
        requestedAt: "2026-07-12T12:00:00.000Z",
        secret: "secret",
      }),
    ).resolves.toEqual({ state: "start" });
    expect(ctx.db.patch).toHaveBeenCalledWith("idea-document", {
      providerRunRequestedAt: "2026-07-12T12:00:00.000Z",
      updatedAt: "2026-07-12T12:00:00.000Z",
    });
  });

  it("does not automatically duplicate an unconfirmed paid start", async () => {
    const ctx = createContext({
      _id: "idea-document",
      id: "idea-1",
      providerRunRequestedAt: "2026-07-12T12:00:00.000Z",
      sourceType: "social_link",
    });

    await expect(
      getHandler()(ctx, {
        id: "idea-1",
        ownerId: "owner-1",
        requestedAt: "2026-07-12T12:01:00.000Z",
        secret: "secret",
      }),
    ).resolves.toEqual({ state: "unconfirmed" });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("resumes a run whose ID is already durable", async () => {
    const ctx = createContext({
      _id: "idea-document",
      id: "idea-1",
      providerRunId: "run-1",
      sourceType: "social_link",
    });

    await expect(
      getHandler()(ctx, {
        id: "idea-1",
        ownerId: "owner-1",
        requestedAt: "2026-07-12T12:01:00.000Z",
        secret: "secret",
      }),
    ).resolves.toEqual({ providerRunId: "run-1", state: "recorded" });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
