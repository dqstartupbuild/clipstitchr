import { beforeEach, describe, expect, it, vi } from "vitest";
import { failSocialPublishTarget } from "./failSocialPublishTarget";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  createNotification: vi.fn(),
  mutation: vi.fn((definition) => definition),
  refreshSocialPostStatus: vi.fn(),
  revokeSocialMediaAccessGrants: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));
vi.mock("../createNotification", () => ({
  createNotification: mocks.createNotification,
}));
vi.mock("../socialPosts/refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));
vi.mock("../socialMedia/revokeSocialMediaAccessGrants", () => ({
  revokeSocialMediaAccessGrants: mocks.revokeSocialMediaAccessGrants,
}));

function createContext({
  attemptStatus,
  targetStatus,
}: {
  attemptStatus?: string;
  targetStatus?: string;
} = {}) {
  const index = { eq: vi.fn(() => index) };
  const target = {
    _id: "target_doc",
    id: "target_1",
    postId: "post_1",
    status: targetStatus,
  };
  const attempt = {
    _id: "attempt_doc",
    id: "attempt_1",
    status: attemptStatus,
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
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("failSocialPublishTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes provider-fetch grants when a target becomes terminal", async () => {
    const ctx = createContext();
    const handler = (failSocialPublishTarget as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      attemptId: "attempt_1",
      errorMessage: "Provider rejected this post.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "target_1",
      "2026-08-01T00:00:00.000Z",
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({ status: "failed" }),
    );
  });

  it("does not overwrite a webhook-confirmed publication with a late failure", async () => {
    const ctx = createContext({
      attemptStatus: "succeeded",
      targetStatus: "published",
    });
    const handler = (failSocialPublishTarget as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      attemptId: "attempt_1",
      errorMessage: "Late worker failure.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.createNotification).not.toHaveBeenCalled();
    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledOnce();
  });
});
