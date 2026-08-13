import { beforeEach, describe, expect, it, vi } from "vitest";
import { grantStudioBetaAccess } from "./grantStudioBetaAccess";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertOwnerId: vi.fn(),
  assertSecret: vi.fn(),
  consumeLimits: vi.fn(),
  getGrant: vi.fn(),
  mutation: vi.fn((definition) => definition),
  recordAudit: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertStudioBetaOperatorSecret", () => ({
  assertStudioBetaOperatorSecret: mocks.assertSecret,
}));
vi.mock("./assertStudioBetaOwnerId", () => ({
  assertStudioBetaOwnerId: mocks.assertOwnerId,
}));
vi.mock("./consumeStudioBetaAdminRateLimits", () => ({
  consumeStudioBetaAdminRateLimits: mocks.consumeLimits,
}));
vi.mock("./getStudioBetaAccessGrantForOwner", () => ({
  getStudioBetaAccessGrantForOwner: mocks.getGrant,
}));
vi.mock("./recordStudioBetaAuditEvent", () => ({
  recordStudioBetaAuditEvent: mocks.recordAudit,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("grantStudioBetaAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getGrant.mockResolvedValue(null);
  });

  it("rate limits, persists, and audits a new allowlist grant", async () => {
    const ctx = { db: { insert: vi.fn().mockResolvedValue("grant_doc") } };

    await expect(
      getHandler(grantStudioBetaAccess)(ctx, {
        ownerId: "user_123",
        secret: "secret",
      }),
    ).resolves.toMatchObject({ changed: true, status: "active" });
    expect(mocks.assertSecret).toHaveBeenCalledWith("secret");
    expect(mocks.assertOwnerId).toHaveBeenCalledWith("user_123");
    expect(mocks.consumeLimits).toHaveBeenCalledWith(ctx, "user_123");
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioBetaAccessGrants",
      expect.objectContaining({
        ownerId: "user_123",
        status: "active",
      }),
    );
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        eventType: "access-granted",
        ownerId: "user_123",
      }),
    );
  });

  it("does not write a duplicate grant or audit event", async () => {
    mocks.getGrant.mockResolvedValue({ status: "active" });
    const ctx = { db: { insert: vi.fn(), patch: vi.fn() } };

    await expect(
      getHandler(grantStudioBetaAccess)(ctx, {
        ownerId: "user_123",
        secret: "secret",
      }),
    ).resolves.toMatchObject({ changed: false });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.recordAudit).not.toHaveBeenCalled();
  });
});
