import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeSocialOAuthState } from "./consumeSocialOAuthState";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

function createContext(state: Record<string, unknown> | null) {
  const index = { eq: vi.fn(() => index) };
  const query = {
    unique: vi.fn(async () => state),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => void) => {
        callback(index);
        return query;
      },
    ),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("consumeSocialOAuthState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
  });

  it("consumes an owner-bound, platform-bound state exactly once", async () => {
    const ctx = createContext({
      _id: "state_doc",
      ownerId: "owner_1",
      platform: "tiktok",
      status: "pending",
      expiresAt: "2026-08-01T00:10:00.000Z",
      redirectUri: "https://app.example.com/callback",
      returnPath: "/dashboard/settings",
    });
    const handler = (consumeSocialOAuthState as unknown as ConvexFunction)
      .handler;

    await expect(
      handler(ctx, {
        platform: "tiktok",
        stateHash: "hash",
        now: "2026-08-01T00:00:00.000Z",
      }),
    ).resolves.toEqual({
      redirectUri: "https://app.example.com/callback",
      returnPath: "/dashboard/settings",
      codeVerifierCiphertext: undefined,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "state_doc",
      expect.objectContaining({ status: "consumed" }),
    );
  });

  it("rejects a state owned by another user or already consumed", async () => {
    const handler = (consumeSocialOAuthState as unknown as ConvexFunction)
      .handler;

    for (const state of [
      {
        _id: "state_doc",
        ownerId: "owner_2",
        platform: "tiktok",
        status: "pending",
        expiresAt: "2026-08-01T00:10:00.000Z",
      },
      {
        _id: "state_doc",
        ownerId: "owner_1",
        platform: "tiktok",
        status: "consumed",
        expiresAt: "2026-08-01T00:10:00.000Z",
      },
    ]) {
      await expect(
        handler(createContext(state), {
          platform: "tiktok",
          stateHash: "hash",
          now: "2026-08-01T00:00:00.000Z",
        }),
      ).rejects.toThrow("expired");
    }
  });
});
