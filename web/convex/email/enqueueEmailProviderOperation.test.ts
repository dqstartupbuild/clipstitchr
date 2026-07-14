import { describe, expect, it, vi } from "vitest";
import { enqueueEmailProviderOperation } from "./enqueueEmailProviderOperation";

vi.mock("../_generated/api", () => ({
  internal: {
    email: {
      processEmailProviderOperation: {
        processEmailProviderOperation: "process-email-operation",
      },
    },
  },
}));

function createContext() {
  return {
    db: { insert: vi.fn(async () => "operation_1") },
    scheduler: { runAfter: vi.fn(), runAt: vi.fn() },
  };
}

describe("enqueueEmailProviderOperation", () => {
  it("schedules ordinary operations immediately", async () => {
    const ctx = createContext();

    await enqueueEmailProviderOperation(ctx as never, {
      contactId: "contact_1" as never,
      kind: "contactSync",
      now: 100,
    });

    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      "process-email-operation",
      { operationId: "operation_1" },
    );
    expect(ctx.scheduler.runAt).not.toHaveBeenCalled();
  });

  it("durably defers a final privacy-deletion sweep", async () => {
    const ctx = createContext();

    await enqueueEmailProviderOperation(ctx as never, {
      compensatesOperationId: "sync_operation_1" as never,
      contactId: "contact_1" as never,
      kind: "contactDelete",
      nextAttemptAt: 500,
      now: 100,
    });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "emailProviderOperations",
      expect.objectContaining({
        kind: "contactDelete",
        nextAttemptAt: 500,
      }),
    );
    expect(ctx.scheduler.runAt).toHaveBeenCalledWith(
      500,
      "process-email-operation",
      { operationId: "operation_1" },
    );
  });
});
