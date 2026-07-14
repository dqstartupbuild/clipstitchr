import { describe, expect, it, vi } from "vitest";
import { recordEmailProviderOperationAccepted } from "./recordEmailProviderOperationAccepted";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));
const mocks = vi.hoisted(() => ({
  enqueueContactDeleteCompensation: vi.fn(
    async (): Promise<string | null> => null,
  ),
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

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("provider acceptance recording", () => {
  it("preserves a provider email ID bound by a racing sent webhook", async () => {
    const operation = {
      _id: "operation_1",
      leaseOwner: "worker_1",
      providerMessageId: "provider_email_1",
      status: "claimed",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(),
      },
    };

    await expect(
      getHandler(recordEmailProviderOperationAccepted)(ctx, {
        acceptedAt: 100,
        operationId: "operation_1",
        workerId: "worker_1",
      }),
    ).resolves.toEqual({ compensationQueued: false, recorded: true });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ status: "accepted" }),
    );
    expect(ctx.db.patch.mock.calls[0]?.[1]).not.toHaveProperty(
      "providerMessageId",
    );
  });

  it("queues correction when a stale worker returns after cancellation and reclaim", async () => {
    const operation = {
      _id: "operation_1",
      attemptCount: 2,
      attemptLeaseOwner: "newer_worker",
      contactId: "contact_1",
      kind: "contactResubscribe",
      status: "canceled",
      updatedAt: 90,
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(),
      },
    };
    mocks.enqueueContactUnsubscribeCompensation.mockResolvedValueOnce(
      "compensation_1",
    );

    await expect(
      getHandler(recordEmailProviderOperationAccepted)(ctx, {
        acceptedAt: 100,
        operationId: "operation_1",
        workerId: "worker_1",
      }),
    ).resolves.toEqual({ compensationQueued: true, recorded: false });
    expect(mocks.enqueueContactUnsubscribeCompensation).toHaveBeenCalledWith(
      ctx,
      {
        compensatesOperationId: "operation_1",
        contactId: "contact_1",
        now: 100,
      },
    );
  });

  it("queues provider deletion when a contact sync returns after privacy cancellation", async () => {
    const operation = {
      _id: "operation_1",
      attemptCount: 1,
      contactId: "contact_1",
      kind: "contactSync",
      status: "canceled",
      updatedAt: 90,
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(),
      },
    };
    mocks.enqueueContactDeleteCompensation.mockResolvedValueOnce(
      "delete_operation_1",
    );

    await expect(
      getHandler(recordEmailProviderOperationAccepted)(ctx, {
        acceptedAt: 100,
        operationId: "operation_1",
        workerId: "stale_worker",
      }),
    ).resolves.toEqual({ compensationQueued: true, recorded: false });
    expect(mocks.enqueueContactDeleteCompensation).toHaveBeenCalledWith(ctx, {
      compensatesOperationId: "operation_1",
      contactId: "contact_1",
      now: 100,
    });
  });

  it("queues provider deletion when an ambiguous dead letter accepts late", async () => {
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "unknown",
      ambiguousAt: 80,
      attemptCount: 7,
      contactId: "contact_1",
      kind: "contactSync",
      status: "deadLetter",
      updatedAt: 90,
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(),
      },
    };
    mocks.enqueueContactDeleteCompensation.mockResolvedValueOnce(
      "delete_operation_1",
    );

    await expect(
      getHandler(recordEmailProviderOperationAccepted)(ctx, {
        acceptedAt: 100,
        operationId: "operation_1",
        workerId: "stale_worker",
      }),
    ).resolves.toEqual({ compensationQueued: true, recorded: false });
    expect(mocks.enqueueContactDeleteCompensation).toHaveBeenCalledWith(ctx, {
      compensatesOperationId: "operation_1",
      contactId: "contact_1",
      now: 100,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        acceptanceStatus: "accepted",
        acceptedAt: 100,
      }),
    );
  });
});
