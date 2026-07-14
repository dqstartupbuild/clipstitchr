import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordInteraction } from "./recordInteraction";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  enqueueEmailProviderOperation: vi.fn(
    async (_ctx: unknown, _args: Record<string, unknown>) => "operation_1",
  ),
  getMarketingContactIsMarketingEligible: vi.fn(() => true),
  rateLimiter: {
    limit: vi.fn(
      async (_ctx: unknown, _bucket: string, _options: unknown) => ({
        ok: true,
      }),
    ),
  },
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: vi.fn(),
}));
vi.mock("../email/enqueueEmailProviderOperation", () => ({
  enqueueEmailProviderOperation: mocks.enqueueEmailProviderOperation,
}));
vi.mock("../marketingContacts/getMarketingContactIsMarketingEligible", () => ({
  getMarketingContactIsMarketingEligible:
    mocks.getMarketingContactIsMarketingEligible,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("./getToolLeadGateModeIsValid", () => ({
  getToolLeadGateModeIsValid: vi.fn(() => true),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(token: unknown) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const chain = {
    unique: vi.fn(async () => token),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return chain;
    }),
  };
  const contact = {
    _id: "contact_1",
    leadStage: "captured",
  };

  return {
    db: {
      get: vi.fn(async () => contact),
      insert: vi.fn(async () => "interaction_1"),
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

const args = {
  clientKey: "a".repeat(64),
  gateMode: "useful-preview" as const,
  gateVariant: "hybrid-v1" as const,
  interactionType: "paidCtaClicked" as const,
  occurredAt: 100,
  recognitionTokenHash: "b".repeat(64),
  secret: "rate-limit-secret",
  source: "app-hook-generator" as const,
};

describe("recognized tool interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMarketingContactIsMarketingEligible.mockReturnValue(true);
  });

  it("consumes every limit before recording bounded qualification metadata", async () => {
    const ctx = createContext({
      _id: "recognition_1",
      contactId: "contact_1",
      expiresAt: 200,
    });

    await expect(getHandler(recordInteraction)(ctx, args)).resolves.toEqual({
      accepted: true,
    });
    expect(mocks.rateLimiter.limit.mock.calls.map((call) => call[1])).toEqual([
      "toolLeadInteractionByToken",
      "toolLeadInteractionByClient",
      "toolLeadInteractionGlobal",
    ]);
    expect(ctx.db.insert).toHaveBeenCalledWith("toolLeadInteractions", {
      contactId: "contact_1",
      gateMode: "useful-preview",
      gateVariant: "hybrid-v1",
      interactionType: "paidCtaClicked",
      occurredAt: 100,
      recognitionTokenId: "recognition_1",
      source: "app-hook-generator",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "contact_1",
      expect.objectContaining({ leadStage: "product-interested" }),
    );
  });

  it("silently accepts an expired token without creating linked state", async () => {
    const ctx = createContext({
      _id: "recognition_1",
      contactId: "contact_1",
      expiresAt: 100,
    });

    await expect(getHandler(recordInteraction)(ctx, args)).resolves.toEqual({
      accepted: true,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(mocks.enqueueEmailProviderOperation).not.toHaveBeenCalled();
  });

  it("stops contact-linked qualification after unsubscribe", async () => {
    const ctx = createContext({
      _id: "recognition_1",
      contactId: "contact_1",
      expiresAt: 200,
    });
    mocks.getMarketingContactIsMarketingEligible.mockReturnValue(false);

    await expect(getHandler(recordInteraction)(ctx, args)).resolves.toEqual({
      accepted: true,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(mocks.enqueueEmailProviderOperation).not.toHaveBeenCalled();
  });
});
