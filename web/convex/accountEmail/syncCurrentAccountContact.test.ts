import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncCurrentAccountContact } from "./syncCurrentAccountContact";

const mocks = vi.hoisted(() => ({
  createWelcome: vi.fn(async () => ({ created: true })),
  limit: vi.fn(),
  resume: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  mutation: vi.fn((definition) => definition),
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));
vi.mock("./createAccountCreatedCommunication", () => ({
  createAccountCreatedCommunication: mocks.createWelcome,
}));
vi.mock("./resumeHeldAccountEmailOperationsForOwner", () => ({
  resumeHeldAccountEmailOperationsForOwner: mocks.resume,
}));

type MutationHandler = {
  handler: (ctx: unknown, args: Record<string, never>) => Promise<unknown>;
};

function createContext(contact: Record<string, unknown> | null = null) {
  const query = {
    unique: vi.fn(async () => contact),
    withIndex: vi.fn(() => query),
  };

  return {
    auth: {
      getUserIdentity: vi.fn(async () => ({
        email: "Owner@Example.com",
        emailVerified: true,
        name: "Owner Example",
        subject: "user_123",
      })),
    },
    db: {
      insert: vi.fn(async () => "contact_123"),
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("syncCurrentAccountContact", () => {
  beforeEach(() => vi.clearAllMocks());

  it("backfills the signed-in account and queues welcome once", async () => {
    const ctx = createContext();
    const result = await (
      syncCurrentAccountContact as unknown as MutationHandler
    ).handler(ctx, {});

    expect(result).toEqual({
      emailUpdated: false,
      synced: true,
      welcomeQueued: true,
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "accountContacts",
      expect.objectContaining({
        emailVerified: true,
        firstName: "Owner",
        normalizedEmail: "owner@example.com",
        ownerId: "user_123",
      }),
    );
    expect(mocks.limit).toHaveBeenCalledTimes(2);
    expect(mocks.resume).toHaveBeenCalledOnce();
    expect(mocks.createWelcome).toHaveBeenCalledOnce();
  });

  it("clears delivery suppression only when the verified email changes", async () => {
    const ctx = createContext({
      _id: "contact_existing",
      emailSuppressedAt: 1,
      emailSuppressionReason: "hardBounce",
      lastClerkEventAt: 1,
      normalizedEmail: "old@example.com",
      primaryEmailId: "email_old",
    });

    await (
      syncCurrentAccountContact as unknown as MutationHandler
    ).handler(ctx, {});

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "contact_existing",
      expect.objectContaining({
        emailSuppressedAt: undefined,
        emailSuppressionReason: undefined,
        normalizedEmail: "owner@example.com",
      }),
    );
  });

  it("fails before provider work without an account email", async () => {
    const ctx = createContext();
    ctx.auth.getUserIdentity.mockResolvedValueOnce({
      email: "",
      emailVerified: true,
      name: "Owner",
      subject: "user_123",
    });

    await expect(
      (syncCurrentAccountContact as unknown as MutationHandler).handler(ctx, {}),
    ).rejects.toThrow("verified account email");
    expect(mocks.createWelcome).not.toHaveBeenCalled();
  });

  it("rejects an account email whose identity claim is not verified", async () => {
    const ctx = createContext();
    ctx.auth.getUserIdentity.mockResolvedValueOnce({
      email: "owner@example.com",
      emailVerified: false,
      name: "Owner",
      subject: "user_123",
    });

    await expect(
      (syncCurrentAccountContact as unknown as MutationHandler).handler(ctx, {}),
    ).rejects.toThrow("verified account email");
    expect(mocks.limit).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.resume).not.toHaveBeenCalled();
    expect(mocks.createWelcome).not.toHaveBeenCalled();
  });
});
