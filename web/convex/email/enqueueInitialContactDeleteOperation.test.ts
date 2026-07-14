import { beforeEach, describe, expect, it, vi } from "vitest";
import { enqueueInitialContactDeleteOperation } from "./enqueueInitialContactDeleteOperation";

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

function createContext(operations: Record<string, unknown>[]) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const queryChain = {
    collect: vi.fn(async () => operations),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return queryChain;
    }),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => queryChain),
    },
    scheduler: { runAfter: vi.fn() },
  };
}

describe("enqueueInitialContactDeleteOperation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueueEmailProviderOperation.mockResolvedValue("delete_operation_1");
  });

  it("creates the initial durable provider deletion", async () => {
    const ctx = createContext([]);

    await expect(
      enqueueInitialContactDeleteOperation(ctx as never, {
        contactId: "contact_1" as never,
        now: 100,
      }),
    ).resolves.toBe("delete_operation_1");
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledWith(ctx, {
      contactId: "contact_1",
      kind: "contactDelete",
      now: 100,
    });
  });

  it("restarts a held initial deletion without duplicating it", async () => {
    const ctx = createContext([
      {
        _id: "delete_operation_1",
        acceptanceStatus: "notAttempted",
        kind: "contactDelete",
        nextAttemptAt: 50,
        status: "held",
      },
    ]);

    await expect(
      enqueueInitialContactDeleteOperation(ctx as never, {
        contactId: "contact_1" as never,
        now: 100,
      }),
    ).resolves.toBe("delete_operation_1");
    expect(mocks.enqueueEmailProviderOperation).not.toHaveBeenCalled();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "delete_operation_1",
      expect.objectContaining({ nextAttemptAt: 100, status: "pending" }),
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledOnce();
  });
});
