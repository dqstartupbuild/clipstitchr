import { beforeEach, describe, expect, it, vi } from "vitest";
import { revokeStudioBetaAccess } from "./revokeStudioBetaAccess";

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

describe("revokeStudioBetaAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getGrant.mockResolvedValue({
      _id: "grant_doc",
      status: "active",
    });
  });

  it("revokes access without deleting the grant or preference", async () => {
    const ctx = { db: { patch: vi.fn() } };

    await expect(
      getHandler(revokeStudioBetaAccess)(ctx, {
        ownerId: "user_123",
        reason: "Beta window closed",
        secret: "secret",
      }),
    ).resolves.toMatchObject({ changed: true, status: "revoked" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "grant_doc",
      expect.objectContaining({
        revocationReason: "Beta window closed",
        status: "revoked",
      }),
    );
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ eventType: "access-revoked" }),
    );
    expect(ctx.db).not.toHaveProperty("delete");
  });

  it("rejects an oversized revocation reason before changing state", async () => {
    const ctx = { db: { patch: vi.fn() } };

    await expect(
      getHandler(revokeStudioBetaAccess)(ctx, {
        ownerId: "user_123",
        reason: "x".repeat(501),
        secret: "secret",
      }),
    ).rejects.toThrow("too long");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.recordAudit).not.toHaveBeenCalled();
  });
});
