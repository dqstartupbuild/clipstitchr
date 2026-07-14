import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelEmailProviderOperationsForContact } from "./cancelEmailProviderOperationsForContact";

const mocks = vi.hoisted(() => ({
  enqueueContactDeleteCompensation: vi.fn(),
  enqueueContactUnsubscribeCompensation: vi.fn(),
}));

vi.mock("./enqueueContactDeleteCompensation", () => ({
  enqueueContactDeleteCompensation:
    mocks.enqueueContactDeleteCompensation,
}));
vi.mock("./enqueueContactUnsubscribeCompensation", () => ({
  enqueueContactUnsubscribeCompensation:
    mocks.enqueueContactUnsubscribeCompensation,
}));

describe("cancelEmailProviderOperationsForContact", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cancels every non-delete operation and fences an in-flight call for privacy", async () => {
    const operations = [
      {
        _id: "sync_operation_1",
        acceptanceStatus: "notAttempted",
        attemptCount: 1,
        contactId: "contact_1",
        idempotencyExpiresAt: 500,
        kind: "contactSync",
        status: "claimed",
      },
      {
        _id: "unsubscribe_operation_1",
        acceptanceStatus: "notAttempted",
        attemptCount: 0,
        contactId: "contact_1",
        idempotencyExpiresAt: 500,
        kind: "contactUnsubscribe",
        status: "pending",
      },
      {
        _id: "delete_operation_1",
        acceptanceStatus: "notAttempted",
        attemptCount: 0,
        contactId: "contact_1",
        idempotencyExpiresAt: 500,
        kind: "contactDelete",
        status: "pending",
      },
    ];
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const queryChain = {
      collect: vi.fn(async () => operations),
      withIndex: vi.fn((_name, callback) => {
        callback(indexQuery);
        return queryChain;
      }),
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };

    await cancelEmailProviderOperationsForContact(
      ctx as never,
      "contact_1" as never,
      100,
      { providerDeletionFence: true },
    );

    expect(mocks.enqueueContactDeleteCompensation).toHaveBeenCalledWith(ctx, {
      compensatesOperationId: "sync_operation_1",
      contactId: "contact_1",
      notBefore: 1_500,
      now: 100,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "unsubscribe_operation_1",
      expect.objectContaining({ status: "canceled" }),
    );
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "delete_operation_1",
      expect.anything(),
    );
  });

  it.each([
    ["pending", true],
    ["deadLetter", false],
  ] as const)(
    "fences a %s operation whose provider acceptance is ambiguous",
    async (status, shouldCancel) => {
      const operation = {
        _id: `sync_operation_${status}`,
        acceptanceStatus: "unknown",
        ambiguousAt: 80,
        attemptCount: 1,
        contactId: "contact_1",
        idempotencyExpiresAt: 500,
        kind: "contactSync",
        status,
      };
      const indexQuery = { eq: vi.fn(() => indexQuery) };
      const queryChain = {
        collect: vi.fn(async () => [operation]),
        withIndex: vi.fn((_name, callback) => {
          callback(indexQuery);
          return queryChain;
        }),
      };
      const ctx = {
        db: {
          patch: vi.fn(),
          query: vi.fn(() => queryChain),
        },
      };

      await cancelEmailProviderOperationsForContact(
        ctx as never,
        "contact_1" as never,
        100,
        { providerDeletionFence: true },
      );

      expect(mocks.enqueueContactDeleteCompensation).toHaveBeenCalledWith(ctx, {
        compensatesOperationId: operation._id,
        contactId: "contact_1",
        notBefore: 1_500,
        now: 100,
      });

      if (shouldCancel) {
        expect(ctx.db.patch).toHaveBeenCalledWith(
          operation._id,
          expect.objectContaining({ status: "canceled" }),
        );
      } else {
        expect(ctx.db.patch).not.toHaveBeenCalled();
      }
    },
  );
});
