import { describe, expect, it, vi } from "vitest";
import { cancelEmailProviderOperationsForContact } from "./cancelEmailProviderOperationsForContact";
import { recordEmailProviderOperationAccepted } from "./recordEmailProviderOperationAccepted";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

describe("privacy deletion provider race", () => {
  it("expedites exactly one final delete after a canceled sync accepts late", async () => {
    const contact = {
      _id: "contact_1",
      deletionStatus: "privacyDeleted",
    };
    const syncOperation = {
      _id: "sync_operation_1",
      acceptanceStatus: "notAttempted",
      attemptCount: 1,
      attemptLeaseOwner: "sync_worker",
      contactId: "contact_1",
      idempotencyExpiresAt: 1_000,
      kind: "contactSync",
      leaseExpiresAt: 500,
      leaseOwner: "sync_worker",
      status: "claimed",
      updatedAt: 50,
    };
    const initialDelete = {
      _id: "initial_delete_operation",
      acceptanceStatus: "accepted",
      attemptCount: 1,
      contactId: "contact_1",
      idempotencyExpiresAt: 1_000,
      kind: "contactDelete",
      nextAttemptAt: 100,
      status: "accepted",
      updatedAt: 100,
    };
    const operations: Record<string, unknown>[] = [
      syncOperation,
      initialDelete,
    ];
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
            const operationId = `delete_compensation_${operations.length}`;
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
            collect: vi.fn(async () =>
              operations.filter((operation) =>
                indexName === "by_compensated_operation"
                  ? operation.compensatesOperationId === indexValue
                  : operation.contactId === indexValue,
              )),
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
      scheduler: { runAfter: vi.fn(), runAt: vi.fn() },
    };

    await cancelEmailProviderOperationsForContact(
      ctx as never,
      "contact_1" as never,
      100,
      { providerDeletionFence: true },
    );

    const handler = (
      recordEmailProviderOperationAccepted as unknown as ConvexFunction<
        { acceptedAt: number; operationId: string; workerId: string },
        unknown
      >
    ).handler;
    await expect(
      handler(ctx, {
        acceptedAt: 200,
        operationId: "sync_operation_1",
        workerId: "sync_worker",
      }),
    ).resolves.toEqual({ compensationQueued: true, recorded: false });

    const finalDeletes = operations.filter(
      (operation) =>
        operation.kind === "contactDelete" &&
        operation.compensatesOperationId === "sync_operation_1",
    );
    expect(finalDeletes).toHaveLength(1);
    expect(finalDeletes[0]).toMatchObject({
      nextAttemptAt: 200,
      status: "pending",
    });
    expect(ctx.scheduler.runAfter).toHaveBeenCalled();
  });
});
