import { describe, expect, it, vi } from "vitest";
import { cancelEmailProviderOperationsForContact } from "./cancelEmailProviderOperationsForContact";
import { recordEmailProviderOperationAccepted } from "./recordEmailProviderOperationAccepted";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

describe("resubscribe acceptance cancellation race", () => {
  it("preserves stale acceptance and queues one correction per canceled resubscribe", async () => {
    const contact = {
      _id: "contact_1",
      consentStatus: "confirmed",
      deletionStatus: "active",
      marketingEligible: true,
      subscriptionStatus: "subscribed",
      suppressionStatus: "none",
      verificationStatus: "verified",
    };
    const reclaimedOperation = {
      _id: "operation_1",
      acceptanceStatus: "unknown",
      attemptCount: 2,
      attemptLeaseOwner: "worker_b",
      contactId: "contact_1",
      kind: "contactResubscribe",
      leaseExpiresAt: 200,
      leaseOwner: "worker_b",
      status: "claimed",
      updatedAt: 90,
    };
    const operations: Record<string, unknown>[] = [reclaimedOperation];
    let indexName = "";
    let indexValue: unknown;
    const indexQuery = {
      eq: vi.fn((_field: string, value: unknown) => {
        indexValue = value;
        return indexQuery;
      }),
    };
    const ctx = {
      db: {
        get: vi.fn(async (id: string) => {
          if (id === contact._id) return contact;
          return operations.find((operation) => operation._id === id) ?? null;
        }),
        insert: vi.fn(
          async (_table: string, fields: Record<string, unknown>) => {
            const operationId = `compensation_${ctx.db.insert.mock.calls.length}`;
            operations.push({ _id: operationId, ...fields });
            return operationId;
          },
        ),
        patch: vi.fn(async (id: string, fields: Record<string, unknown>) => {
          const operation = operations.find(
            (candidate) => candidate._id === id,
          );
          if (operation) Object.assign(operation, fields);
        }),
        query: vi.fn(() => {
          const chain = {
            collect: vi.fn(async () => operations),
            unique: vi.fn(async () =>
              indexName === "by_compensated_operation"
                ? (operations.find(
                    (operation) =>
                      operation.compensatesOperationId === indexValue,
                  ) ?? null)
                : null,
            ),
            withIndex: vi.fn(
              (name: string, callback: (query: unknown) => void) => {
                indexName = name;
                callback(indexQuery);
                return chain;
              },
            ),
          };
          return chain;
        }),
      },
      scheduler: { runAfter: vi.fn() },
    };
    const handler = (
      recordEmailProviderOperationAccepted as unknown as ConvexFunction<
        {
          acceptedAt: number;
          operationId: string;
          workerId: string;
        },
        unknown
      >
    ).handler;

    await expect(
      handler(ctx, {
        acceptedAt: 100,
        operationId: "operation_1",
        workerId: "worker_a",
      }),
    ).resolves.toEqual({ compensationQueued: false, recorded: false });
    expect(reclaimedOperation).toMatchObject({
      acceptanceStatus: "accepted",
      acceptedAt: 100,
      attemptLeaseOwner: "worker_b",
      leaseExpiresAt: 200,
      leaseOwner: "worker_b",
      status: "claimed",
    });

    Object.assign(contact, {
      consentStatus: "withdrawn",
      marketingEligible: false,
      subscriptionStatus: "unsubscribed",
    });
    await cancelEmailProviderOperationsForContact(
      ctx as never,
      "contact_1" as never,
      110,
    );
    await cancelEmailProviderOperationsForContact(
      ctx as never,
      "contact_1" as never,
      120,
    );

    expect(reclaimedOperation).toMatchObject({
      acceptanceStatus: "accepted",
      attemptLeaseOwner: undefined,
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      status: "canceled",
    });
    expect(
      operations.filter(
        (operation) =>
          operation.kind === "contactUnsubscribe" &&
          operation.compensatesOperationId === reclaimedOperation._id,
      ),
    ).toHaveLength(1);

    const terminalOperation = {
      _id: "operation_2",
      acceptanceStatus: "accepted",
      attemptCount: 1,
      contactId: "contact_1",
      kind: "contactResubscribe",
      status: "accepted",
      updatedAt: 105,
    };
    operations.push(terminalOperation);
    await cancelEmailProviderOperationsForContact(
      ctx as never,
      "contact_1" as never,
      130,
    );
    await cancelEmailProviderOperationsForContact(
      ctx as never,
      "contact_1" as never,
      140,
    );

    expect(terminalOperation.status).toBe("accepted");
    expect(
      operations.filter(
        (operation) =>
          operation.kind === "contactUnsubscribe" &&
          operation.compensatesOperationId === terminalOperation._id,
      ),
    ).toHaveLength(1);
  });
});
