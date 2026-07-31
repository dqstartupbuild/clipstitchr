import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateSocialPost } from "./updateSocialPost";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertOwnerCanPublishSocial: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../billing/assertOwnerCanPublishSocial", () => ({
  assertOwnerCanPublishSocial: mocks.assertOwnerCanPublishSocial,
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));

function createContext() {
  const post = {
    _id: "post_doc",
    id: "post_1",
    ownerId: "owner_1",
    scheduleMode: "exact_time",
    scheduledFor: "2026-08-10T14:00:00.000Z",
  };
  const targets = [
    {
      _id: "target_doc",
      id: "target_1",
      status: "scheduled",
    },
  ];

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const index = { eq: vi.fn(() => index) };
        const chain = {
          collect: vi.fn(async () =>
            table === "socialPostTargets" ? targets : [],
          ),
          unique: vi.fn(async () => (table === "socialPosts" ? post : null)),
          withIndex: vi.fn(
            (_name: string, callback: (value: typeof index) => void) => {
              callback(index);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };
}

describe("updateSocialPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.assertOwnerCanPublishSocial.mockResolvedValue({ state: "active" });
  });

  it("moves the target execution time with an edited exact-time post", async () => {
    const ctx = createContext();
    const handler = (updateSocialPost as unknown as ConvexFunction).handler;
    const scheduledFor = "2026-08-12T15:30:00.000Z";

    await handler(ctx, {
      id: "post_1",
      title: "Updated title",
      caption: "Updated caption",
      scheduledFor,
      now: "2026-08-02T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        scheduledFor,
        nextAttemptAt: scheduledFor,
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "post_doc",
      expect.not.objectContaining({ approvedAt: expect.anything() }),
    );
  });
});
