import { beforeEach, describe, expect, it, vi } from "vitest";
import { setStudioBetaPreference } from "./setStudioBetaPreference";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAccessState: vi.fn(),
  getGrant: vi.fn(),
  getOwnerId: vi.fn(),
  getPreference: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
  recordAudit: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("./getStudioBetaAccessGrantForOwner", () => ({
  getStudioBetaAccessGrantForOwner: mocks.getGrant,
}));
vi.mock("./getStudioBetaAccessStateForOwner", () => ({
  getStudioBetaAccessStateForOwner: mocks.getAccessState,
}));
vi.mock("./getStudioBetaPreferenceForOwner", () => ({
  getStudioBetaPreferenceForOwner: mocks.getPreference,
}));
vi.mock("./recordStudioBetaAuditEvent", () => ({
  recordStudioBetaAuditEvent: mocks.recordAudit,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("setStudioBetaPreference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STUDIO_BETA_ENABLED = "true";
    mocks.getOwnerId.mockResolvedValue("user_123");
    mocks.getGrant.mockResolvedValue({ status: "active" });
    mocks.getPreference.mockResolvedValue(null);
    mocks.getAccessState.mockResolvedValue({ hasAccess: true });
  });

  it("rejects preference writes from a non-allowlisted user", async () => {
    mocks.getGrant.mockResolvedValue(null);

    await expect(
      getHandler(setStudioBetaPreference)({ db: {} }, { enabled: true }),
    ).rejects.toThrow("unavailable");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
  });

  it("rate limits, saves, and audits an opt-in", async () => {
    const ctx = { db: { insert: vi.fn() } };

    await getHandler(setStudioBetaPreference)(ctx, { enabled: true });

    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "studioBetaPreferenceUpdate",
      { key: "user_123", throws: true },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioBetaPreferences",
      expect.objectContaining({ enabled: true, ownerId: "user_123" }),
    );
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ eventType: "preference-enabled" }),
    );
  });

  it("keeps saved work and records only a preference change on opt-out", async () => {
    mocks.getPreference.mockResolvedValue({
      _id: "preference_doc",
      enabled: true,
    });
    const ctx = { db: { patch: vi.fn() } };

    await getHandler(setStudioBetaPreference)(ctx, { enabled: false });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "preference_doc",
      expect.objectContaining({ enabled: false }),
    );
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ eventType: "preference-disabled" }),
    );
    expect(ctx.db).not.toHaveProperty("delete");
  });
});
