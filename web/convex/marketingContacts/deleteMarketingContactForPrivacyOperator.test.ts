import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteMarketingContactForPrivacyOperator } from "./deleteMarketingContactForPrivacyOperator";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertSecret: vi.fn(),
  getConfiguration: vi.fn(),
}));

vi.mock("../_generated/api", () => ({
  internal: {
    marketingContacts: {
      deleteMarketingContactForPrivacy: {
        deleteMarketingContactForPrivacy: "delete-contact-locally",
      },
    },
  },
}));
vi.mock("../_generated/server", () => ({
  action: vi.fn((value) => value),
}));
vi.mock("../auth/assertPrivacyDeletionOperatorSecret", () => ({
  assertPrivacyDeletionOperatorSecret: mocks.assertSecret,
}));
vi.mock(
  "../../lib/clipstitchr/email/loops/getLoopsPrivacyDeletionConfiguration",
  () => ({
    getLoopsPrivacyDeletionConfiguration: mocks.getConfiguration,
  }),
);

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("marketing contact privacy deletion operator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertSecret.mockReset();
    mocks.getConfiguration.mockReset();
    mocks.getConfiguration.mockReturnValue({
      apiKey: "configured",
      teamEnvironment: "development",
    });
    vi.spyOn(Date, "now").mockReturnValue(100);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does no work when the dedicated operator secret is rejected", async () => {
    mocks.assertSecret.mockImplementation(() => {
      throw new Error("Not authorized");
    });
    const ctx = { runMutation: vi.fn() };

    await expect(
      getHandler(deleteMarketingContactForPrivacyOperator)(ctx, {
        contactId: "contact_1",
        secret: "wrong",
      }),
    ).rejects.toThrow("Not authorized");
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("deletes local data even when provider deletion is not configured", async () => {
    mocks.getConfiguration.mockReturnValue(null);
    const ctx = {
      runMutation: vi.fn().mockResolvedValue({
        deleted: true,
        providerDeleteOperationId: "delete_operation_1",
      }),
    };

    await expect(
      getHandler(deleteMarketingContactForPrivacyOperator)(ctx, {
        contactId: "contact_1",
        secret: "configured",
      }),
    ).resolves.toEqual({
      deleted: true,
      providerDeletion: "not-configured",
    });
  });

  it("reports the durable provider deletion as queued", async () => {
    const ctx = {
      runMutation: vi.fn().mockResolvedValueOnce({
        deleted: true,
        providerDeleteOperationId: "delete_operation_1",
      }),
    };

    await expect(
      getHandler(deleteMarketingContactForPrivacyOperator)(ctx, {
        contactId: "contact_1",
        secret: "configured",
      }),
    ).resolves.toEqual({
      deleted: true,
      providerDeletion: "queued",
    });
    expect(ctx.runMutation).toHaveBeenCalledOnce();
    expect(ctx.runMutation).toHaveBeenCalledWith("delete-contact-locally", {
      contactId: "contact_1",
      deletedAt: 100,
    });
    expect(JSON.stringify(ctx.runMutation.mock.calls)).not.toContain("@example");
  });

  it("returns a bounded status when the local contact is already absent", async () => {
    const ctx = {
      runMutation: vi.fn().mockResolvedValueOnce({
        deleted: false,
        providerDeleteOperationId: null,
      }),
    };

    await expect(
      getHandler(deleteMarketingContactForPrivacyOperator)(ctx, {
        contactId: "contact_1",
        secret: "configured",
      }),
    ).resolves.toEqual({
      deleted: false,
      providerDeletion: "not-found",
    });
  });
});
