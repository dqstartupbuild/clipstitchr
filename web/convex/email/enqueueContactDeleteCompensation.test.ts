import { beforeEach, describe, expect, it, vi } from "vitest";
import { enqueueContactDeleteCompensation } from "./enqueueContactDeleteCompensation";

const mocks = vi.hoisted(() => ({
  enqueueEmailProviderOperation: vi.fn(),
}));

vi.mock("../_generated/api", () => ({
  internal: {
    email: {
      processEmailProviderOperation: {
        processEmailProviderOperation: "process-email-operation",
      },
    },
  },
}));
vi.mock("./enqueueEmailProviderOperation", () => ({
  enqueueEmailProviderOperation: mocks.enqueueEmailProviderOperation,
}));

function createContext(
  contact: Record<string, unknown> | null,
  compensations: Record<string, unknown>[],
) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const queryChain = {
    collect: vi.fn(async () => compensations),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return queryChain;
    }),
  };

  return {
    db: {
      get: vi.fn(async () => contact),
      patch: vi.fn(),
      query: vi.fn(() => queryChain),
    },
    scheduler: { runAfter: vi.fn(), runAt: vi.fn() },
  };
}

describe("enqueueContactDeleteCompensation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueueEmailProviderOperation.mockResolvedValue("delete_operation_1");
  });

  it("schedules a final delete after an in-flight operation's safety window", async () => {
    const ctx = createContext({ deletionStatus: "privacyDeleted" }, []);

    await expect(
      enqueueContactDeleteCompensation(ctx as never, {
        compensatesOperationId: "sync_operation_1" as never,
        contactId: "contact_1" as never,
        notBefore: 500,
        now: 100,
      }),
    ).resolves.toBe("delete_operation_1");
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledWith(ctx, {
      compensatesOperationId: "sync_operation_1",
      contactId: "contact_1",
      kind: "contactDelete",
      nextAttemptAt: 500,
      now: 100,
    });
  });

  it("expedites the same compensation after late acceptance", async () => {
    const ctx = createContext(
      { deletionStatus: "privacyDeleted" },
      [
        {
          _id: "delete_operation_1",
          compensatesOperationId: "sync_operation_1",
          kind: "contactDelete",
          nextAttemptAt: 500,
          status: "pending",
        },
      ],
    );

    await expect(
      enqueueContactDeleteCompensation(ctx as never, {
        compensatesOperationId: "sync_operation_1" as never,
        contactId: "contact_1" as never,
        now: 100,
      }),
    ).resolves.toBe("delete_operation_1");
    expect(ctx.db.patch).toHaveBeenCalledWith("delete_operation_1", {
      nextAttemptAt: 100,
      updatedAt: 100,
    });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledOnce();
  });

  it("does nothing unless canonical state has a deletion fence", async () => {
    const ctx = createContext({ deletionStatus: "active" }, []);

    await expect(
      enqueueContactDeleteCompensation(ctx as never, {
        compensatesOperationId: "sync_operation_1" as never,
        contactId: "contact_1" as never,
        now: 100,
      }),
    ).resolves.toBeNull();
    expect(mocks.enqueueEmailProviderOperation).not.toHaveBeenCalled();
  });

  it("also fences a provider-originated deletion", async () => {
    const ctx = createContext({ deletionStatus: "providerDeleted" }, []);

    await expect(
      enqueueContactDeleteCompensation(ctx as never, {
        compensatesOperationId: "unsubscribe_operation_1" as never,
        contactId: "contact_1" as never,
        now: 100,
      }),
    ).resolves.toBe("delete_operation_1");
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ kind: "contactDelete" }),
    );
  });
});
