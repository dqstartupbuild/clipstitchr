import { beforeEach, describe, expect, it, vi } from "vitest";
import { setProductSocialAccounts } from "./setProductSocialAccounts";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProductBelongsToOwner: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../assertProductBelongsToOwner", () => ({
  assertProductBelongsToOwner: mocks.assertProductBelongsToOwner,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));

function createChain(options: { unique?: unknown; collect?: unknown[] }) {
  const index = { eq: vi.fn(() => index) };
  const chain = {
    collect: vi.fn(async () => options.collect ?? []),
    unique: vi.fn(async () => options.unique ?? null),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => void) => {
        callback(index);
        return chain;
      },
    ),
  };

  return chain;
}

describe("setProductSocialAccounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
  });

  it("links multiple accounts on the same platform without a plan count", async () => {
    const accountResults = [
      {
        id: "tiktok_1",
        ownerId: "owner_1",
        platform: "tiktok",
        status: "connected",
      },
      {
        id: "tiktok_2",
        ownerId: "owner_1",
        platform: "tiktok",
        status: "connected",
      },
    ];
    const ctx = {
      db: {
        delete: vi.fn(),
        insert: vi.fn(),
        query: vi.fn((table: string) =>
          table === "socialAccounts"
            ? createChain({ unique: accountResults.shift() })
            : createChain({ collect: [] }),
        ),
      },
    };
    const handler = (setProductSocialAccounts as unknown as ConvexFunction)
      .handler;

    await expect(
      handler(ctx, {
        productId: "product_1",
        accountIds: ["tiktok_1", "tiktok_2", "tiktok_2"],
        now: "2026-08-01T00:00:00.000Z",
      }),
    ).resolves.toEqual(["tiktok_1", "tiktok_2"]);
    expect(ctx.db.insert).toHaveBeenCalledTimes(2);
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "productSocialAccounts",
      expect.objectContaining({ socialAccountId: "tiktok_2" }),
    );
  });
});
