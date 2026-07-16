import { describe, expect, it, vi } from "vitest";
import { enqueueAccountEmailOperation } from "./enqueueAccountEmailOperation";

function createContext(existing: Record<string, unknown> | null = null) {
  const query = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn(() => query),
  };

  return {
    db: {
      insert: vi.fn(async () => "account_email_operation_1"),
      query: vi.fn(() => query),
    },
    scheduler: { runAfter: vi.fn() },
  };
}

describe("enqueueAccountEmailOperation", () => {
  it("durably schedules one server-owned account message", async () => {
    const ctx = createContext();
    const result = await enqueueAccountEmailOperation(ctx as never, {
      communicationKey: "invoice:in_123:paid",
      dataVariables: { planName: "Agency" },
      now: 1_000,
      ownerId: "user_123",
      templateKey: "subscription-status",
    });

    expect(result).toEqual({
      created: true,
      operationId: "account_email_operation_1",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "accountEmailOperations",
      expect.objectContaining({
        communicationKey: "account:user_123:invoice:in_123:paid",
        deliveryStatus: "pending",
        ownerId: "user_123",
        status: "pending",
        templateKey: "subscription-status",
      }),
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledOnce();
  });

  it("returns the existing operation without scheduling a duplicate", async () => {
    const ctx = createContext({ _id: "existing_operation" });

    await expect(
      enqueueAccountEmailOperation(ctx as never, {
        communicationKey: "refill:pi_123:granted",
        dataVariables: {},
        now: 1_000,
        ownerId: "user_123",
        templateKey: "credits-updated",
      }),
    ).resolves.toEqual({
      created: false,
      operationId: "existing_operation",
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.scheduler.runAfter).not.toHaveBeenCalled();
  });
});
