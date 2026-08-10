import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearSecret, saveSecret } from "./socialPublishingSettings";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  clearSocialPublishingSocialAccountIdsForOwner: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./clearSocialPublishingSocialAccountIdsForOwner", () => ({
  clearSocialPublishingSocialAccountIdsForOwner:
    mocks.clearSocialPublishingSocialAccountIdsForOwner,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(settings: unknown) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    unique: vi.fn(async () => settings),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

describe("socialPublishingSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clearSocialPublishingSocialAccountIdsForOwner.mockResolvedValue(undefined);
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("clears product account defaults before deleting saved settings", async () => {
    const settings = { _id: "social_publishing_settings_doc" };
    const queryChain = createQueryChain(settings);
    const ctx = {
      db: {
        delete: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(clearSecret)(ctx, {})).resolves.toBe(
      "social_publishing_settings_doc",
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(mocks.clearSocialPublishingSocialAccountIdsForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      expect.any(String),
    );
    expect(ctx.db.delete).toHaveBeenCalledWith("social_publishing_settings_doc");
  });

  it("clears product account defaults when a saved key changes", async () => {
    const settings = {
      _id: "social_publishing_settings_doc",
      apiKeyLast4: "1111",
    };
    const queryChain = createQueryChain(settings);
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler(saveSecret)(ctx, {
        apiKeyLast4: "2222",
        clearLinkedAccountIds: true,
        encryptedApiKey: "encrypted_new_key",
        lastVerifiedAt: "2026-07-03T12:00:00.000Z",
        updatedAt: "2026-07-03T12:00:00.000Z",
      }),
    ).resolves.toBe("social_publishing_settings_doc");
    expect(mocks.clearSocialPublishingSocialAccountIdsForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      "2026-07-03T12:00:00.000Z",
    );
    expect(ctx.db.patch).toHaveBeenCalledWith("social_publishing_settings_doc", {
      apiKeyLast4: "2222",
      encryptedApiKey: "encrypted_new_key",
      lastVerifiedAt: "2026-07-03T12:00:00.000Z",
      updatedAt: "2026-07-03T12:00:00.000Z",
    });
  });

  it("keeps product account defaults when the saved key metadata does not change", async () => {
    const settings = {
      _id: "social_publishing_settings_doc",
      apiKeyLast4: "1111",
    };
    const queryChain = createQueryChain(settings);
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler(saveSecret)(ctx, {
        apiKeyLast4: "1111",
        clearLinkedAccountIds: false,
        encryptedApiKey: "encrypted_refreshed_key",
        lastVerifiedAt: "2026-07-03T12:00:00.000Z",
        updatedAt: "2026-07-03T12:00:00.000Z",
      }),
    ).resolves.toBe("social_publishing_settings_doc");
    expect(
      mocks.clearSocialPublishingSocialAccountIdsForOwner,
    ).not.toHaveBeenCalled();
    expect(ctx.db.patch).toHaveBeenCalledWith("social_publishing_settings_doc", {
      apiKeyLast4: "1111",
      encryptedApiKey: "encrypted_refreshed_key",
      lastVerifiedAt: "2026-07-03T12:00:00.000Z",
      updatedAt: "2026-07-03T12:00:00.000Z",
    });
  });

  it("clears product account defaults even when saved settings are already gone", async () => {
    const queryChain = createQueryChain(null);
    const ctx = {
      db: {
        delete: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(clearSecret)(ctx, {})).resolves.toBeNull();
    expect(mocks.clearSocialPublishingSocialAccountIdsForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      expect.any(String),
    );
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });
});
