import { describe, expect, it, vi } from "vitest";
import { getEmailProviderOperationKind } from "./getEmailProviderOperationKind";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalQuery: vi.fn((value) => value),
}));

describe("getEmailProviderOperationKind", () => {
  it("returns only the stored operation kind", async () => {
    const ctx = {
      db: {
        get: vi.fn(async () => ({ kind: "contactDelete" })),
      },
    };
    const handler = (
      getEmailProviderOperationKind as unknown as ConvexFunction<
        { operationId: string },
        string | null
      >
    ).handler;

    await expect(
      handler(ctx, { operationId: "operation_1" }),
    ).resolves.toBe("contactDelete");
  });
});
