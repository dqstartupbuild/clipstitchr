import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeSocialPublishTarget } from "./completeSocialPublishTarget";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  refreshSocialPostStatus: vi.fn(),
  revokeSocialMediaAccessGrants: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));
vi.mock("../socialPosts/refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));
vi.mock("../socialMedia/revokeSocialMediaAccessGrants", () => ({
  revokeSocialMediaAccessGrants: mocks.revokeSocialMediaAccessGrants,
}));

function createContext(targetStatus?: string) {
  const index = { eq: vi.fn(() => index) };
  const target = {
    _id: "target_doc",
    id: "target_1",
    postId: "post_1",
    platform: "tiktok",
    socialAccountId: "account_1",
    status: targetStatus,
  };
  const attempt = {
    _id: "attempt_doc",
    id: "attempt_1",
    targetId: "target_1",
  };
  const chain = {
    filter: vi.fn(() => chain),
    first: vi.fn(async () => attempt),
    unique: vi.fn(async () => null),
    withIndex: vi.fn(
      (name: string, callback: (value: typeof index) => void) => {
        callback(index);
        if (name === "by_owner_id") {
          return { ...chain, unique: vi.fn(async () => target) };
        }
        return chain;
      },
    ),
  };

  return {
    db: {
      insert: vi.fn(),
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("completeSocialPublishTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores every public ID returned by one TikTok delivery", async () => {
    const ctx = createContext();
    const handler = (completeSocialPublishTarget as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      attemptId: "attempt_1",
      platform: "tiktok",
      publicationIds: ["video_1", "video_2", "video_2"],
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.insert).toHaveBeenCalledTimes(2);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({ status: "published" }),
    );
  });

  it("records inbox acceptance as waiting for the user, not published", async () => {
    const ctx = createContext();
    const handler = (completeSocialPublishTarget as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      attemptId: "attempt_1",
      platform: "tiktok",
      publicationIds: [],
      awaitingUser: true,
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        status: "waiting_for_user",
        publishedAt: undefined,
      }),
    );
  });

  it("does not downgrade a webhook-confirmed publication to inbox waiting", async () => {
    const ctx = createContext("published");
    const handler = (completeSocialPublishTarget as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      attemptId: "attempt_1",
      platform: "tiktok",
      publicationIds: [],
      awaitingUser: true,
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        status: "published",
      }),
    );
  });
});
