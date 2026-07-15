import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteMarketingContactForPrivacy } from "./deleteMarketingContactForPrivacy";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  cancelEmailProviderOperationsForContact: vi.fn(),
  enqueueInitialContactDeleteOperation: vi.fn(),
  rateLimit: vi.fn(),
  resumeHeldContactDeleteOperationsForContact: vi.fn(),
  revokeBrowserRecognitionTokensForContact: vi.fn(),
  deleteCourseAccessForContact: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));
vi.mock(
  "../browserRecognition/revokeBrowserRecognitionTokensForContact",
  () => ({
    revokeBrowserRecognitionTokensForContact:
      mocks.revokeBrowserRecognitionTokensForContact,
  }),
);
vi.mock("../courseAccess/deleteCourseAccessForContact", () => ({
  deleteCourseAccessForContact: mocks.deleteCourseAccessForContact,
}));
vi.mock("../email/cancelEmailProviderOperationsForContact", () => ({
  cancelEmailProviderOperationsForContact:
    mocks.cancelEmailProviderOperationsForContact,
}));
vi.mock("../email/enqueueInitialContactDeleteOperation", () => ({
  enqueueInitialContactDeleteOperation:
    mocks.enqueueInitialContactDeleteOperation,
}));
vi.mock("../email/resumeHeldContactDeleteOperationsForContact", () => ({
  resumeHeldContactDeleteOperationsForContact:
    mocks.resumeHeldContactDeleteOperationsForContact,
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.rateLimit },
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("marketing contact privacy deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueueInitialContactDeleteOperation.mockResolvedValue(
      "delete_operation_1",
    );
  });

  it("revokes associations and deletes migrated legacy waitlist PII", async () => {
    const contact = {
      _id: "contact_1",
      contactName: "Person Name",
      currentConsentId: "consent_1",
      legacyWaitlistId: "waitlist_1",
      normalizedEmail: "person@example.com",
      providerContactKey: "provider_key",
    };
    const consent = {
      _id: "consent_1",
      legacyWaitlistId: "waitlist_1",
    };
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const queryChain = {
      collect: vi.fn(async () => [consent]),
      withIndex: vi.fn((_name, callback) => {
        callback(indexQuery);
        return queryChain;
      }),
    };
    const ctx = {
      db: {
        get: vi.fn(async (id) =>
          id === "contact_1"
            ? contact
            : id === "waitlist_1"
              ? { _id: "waitlist_1", email: "person@example.com" }
              : null,
        ),
        delete: vi.fn(),
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler(deleteMarketingContactForPrivacy)(ctx, {
        contactId: "contact_1",
        deletedAt: 100,
      }),
    ).resolves.toEqual({
      deleted: true,
      providerDeleteOperationId: "delete_operation_1",
    });
    expect(mocks.rateLimit).toHaveBeenCalledWith(
      ctx,
      "marketingPrivacyDeletionOperator",
      { throws: true },
    );
    expect(mocks.revokeBrowserRecognitionTokensForContact).toHaveBeenCalledWith(
      ctx,
      "contact_1",
    );
    expect(mocks.deleteCourseAccessForContact).toHaveBeenCalledWith(
      ctx,
      "contact_1",
    );
    expect(mocks.cancelEmailProviderOperationsForContact).toHaveBeenCalledWith(
      ctx,
      "contact_1",
      100,
      { providerDeletionFence: true },
    );
    expect(mocks.enqueueInitialContactDeleteOperation).toHaveBeenCalledWith(
      ctx,
      { contactId: "contact_1", now: 100 },
    );
    expect(
      mocks.resumeHeldContactDeleteOperationsForContact,
    ).toHaveBeenCalledWith(ctx, { contactId: "contact_1", now: 100 });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "consent_1",
      expect.objectContaining({
        legacyWaitlistId: undefined,
        status: "withdrawn",
      }),
    );
    expect(ctx.db.delete).toHaveBeenCalledWith("waitlist_1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "contact_1",
      expect.objectContaining({
        contactName: "Deleted contact",
        deletionStatus: "privacyDeleted",
        firstTool: undefined,
        latestTool: undefined,
        legacyWaitlistId: undefined,
        marketingEligible: false,
        normalizedEmail: "deleted-contact_1",
      }),
    );
    const contactPatchIndex = ctx.db.patch.mock.calls.findIndex(
      ([id]) => id === "contact_1",
    );
    expect(
      ctx.db.patch.mock.invocationCallOrder[contactPatchIndex],
    ).toBeLessThan(
      mocks.cancelEmailProviderOperationsForContact.mock
        .invocationCallOrder[0]!,
    );
    expect(JSON.stringify(ctx.db.patch.mock.calls)).not.toContain(
      "person@example.com",
    );
  });
});
