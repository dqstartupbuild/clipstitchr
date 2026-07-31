import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSocialMediaAccessGrant } from "./createSocialMediaAccessGrant";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimit: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.rateLimit },
}));

function createContext({
  assets,
  target,
}: {
  assets: Array<{ objectKey: string }>;
  target: { id: string; postId: string } | null;
}) {
  const index = { eq: vi.fn(() => index) };

  return {
    db: {
      insert: vi.fn(),
      query: vi.fn((table: string) => ({
        collect: vi.fn(async () =>
          table === "socialPostAssets" ? assets : [],
        ),
        unique: vi.fn(async () =>
          table === "socialPostTargets" ? target : null,
        ),
        withIndex: vi.fn(
          (_name: string, callback: (value: typeof index) => void) => {
            callback(index);
            return {
              collect: vi.fn(async () =>
                table === "socialPostAssets" ? assets : [],
              ),
              unique: vi.fn(async () =>
                table === "socialPostTargets" ? target : null,
              ),
            };
          },
        ),
      })),
    },
  };
}

const args = {
  secret: "worker-secret",
  ownerId: "owner_1",
  id: "grant_1",
  targetId: "target_1",
  objectKey: "users/owner_1/social-post-assets/asset_1/media.mp4",
  tokenHash: "opaque-token-hash",
  expiresAt: "2026-08-02T00:00:00.000Z",
  now: "2026-08-01T00:00:00.000Z",
};

describe("createSocialMediaAccessGrant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a grant only for an asset belonging to the exact target post", async () => {
    const ctx = createContext({
      assets: [{ objectKey: args.objectKey }],
      target: { id: "target_1", postId: "post_1" },
    });
    const handler = (
      createSocialMediaAccessGrant as unknown as ConvexFunction
    ).handler;

    await expect(handler(ctx, args)).resolves.toBe("grant_1");
    expect(mocks.rateLimit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "socialMediaGrantCreate",
      { key: "owner_1", throws: true },
    );
    expect(mocks.rateLimit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "socialMediaGrantCreateGlobal",
      { throws: true },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "socialMediaAccessGrants",
      expect.objectContaining({
        objectKey: args.objectKey,
        ownerId: "owner_1",
        targetId: "target_1",
        tokenHash: "opaque-token-hash",
      }),
    );
  });

  it("rejects an owner object that is not part of the target post", async () => {
    const ctx = createContext({
      assets: [
        {
          objectKey:
            "users/owner_1/social-post-assets/other-asset/media.mp4",
        },
      ],
      target: { id: "target_1", postId: "post_1" },
    });
    const handler = (
      createSocialMediaAccessGrant as unknown as ConvexFunction
    ).handler;

    await expect(handler(ctx, args)).rejects.toThrow(
      "not part of the social post",
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
