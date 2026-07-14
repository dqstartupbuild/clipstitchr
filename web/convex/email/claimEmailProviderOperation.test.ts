import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimEmailProviderOperation } from "./claimEmailProviderOperation";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getEmailOperationDispatchEligibility: vi.fn(() => ({ eligible: true })),
}));

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));
vi.mock("./getEmailOperationDispatchEligibility", () => ({
  getEmailOperationDispatchEligibility:
    mocks.getEmailOperationDispatchEligibility,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(
  operation: Record<string, unknown>,
  dependency: Record<string, unknown> | null = null,
) {
  const contact = { _id: "contact_1", providerContactKey: "provider_1" };
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const chain = {
    collect: vi.fn(async () => []),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return chain;
    }),
  };
  const db = {
    get: vi.fn(async (id) =>
      id === "operation_1"
        ? operation
        : id === "dependency_1"
          ? dependency
          : id === "contact_1"
            ? contact
            : null,
    ),
    patch: vi.fn(async (id, fields) => Object.assign(operation, fields, { _id: id })),
    query: vi.fn(() => chain),
  };

  return { db, scheduler: { runAt: vi.fn() } };
}

const now = 1_000;
const claimArgs = {
  leaseExpiresAt: now + 60_000,
  now,
  operationId: "operation_1",
  workerId: "worker_1",
};

describe("email provider operation claim", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows only one worker inside a live lease", async () => {
    const ctx = createContext({
      _id: "operation_1",
      attemptCount: 1,
      idempotencyExpiresAt: now + 100_000,
      leaseExpiresAt: now + 30_000,
      nextAttemptAt: 0,
      status: "claimed",
    });

    await expect(getHandler(claimEmailProviderOperation)(ctx, claimArgs)).resolves.toBeNull();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("dead-letters an ambiguous acceptance after the provider window", async () => {
    const ctx = createContext({
      _id: "operation_1",
      acceptanceStatus: "unknown",
      attemptCount: 1,
      idempotencyExpiresAt: now,
      nextAttemptAt: 0,
      status: "pending",
    });

    await expect(getHandler(claimEmailProviderOperation)(ctx, claimArgs)).resolves.toBeNull();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        failureCategory: "ambiguous",
        status: "deadLetter",
      }),
    );
  });

  it("keeps idempotent contact deletion retryable after that window", async () => {
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "unknown",
      attemptCount: 1,
      contactId: "contact_1",
      idempotencyExpiresAt: now,
      kind: "contactDelete",
      nextAttemptAt: 0,
      status: "pending",
    };
    const ctx = createContext(operation);

    await expect(
      getHandler(claimEmailProviderOperation)(ctx, claimArgs),
    ).resolves.toMatchObject({
      kind: "contactDelete",
      leaseOwner: "worker_1",
      status: "claimed",
    });
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ status: "deadLetter" }),
    );
  });

  it("assigns a bounded lease without consuming a provider attempt", async () => {
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "notAttempted",
      attemptCount: 0,
      contactId: "contact_1",
      idempotencyExpiresAt: now + 100_000,
      nextAttemptAt: 0,
      status: "pending",
    };
    const ctx = createContext(operation);

    await expect(
      getHandler(claimEmailProviderOperation)(ctx, claimArgs),
    ).resolves.toMatchObject({
      attemptCount: 0,
      leaseOwner: "worker_1",
      status: "claimed",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ status: "claimed" }),
    );
    expect(ctx.db.patch.mock.calls[0]?.[1]).not.toHaveProperty("attemptCount");
    expect(ctx.scheduler.runAt).toHaveBeenCalledWith(
      claimArgs.leaseExpiresAt + 1_000,
      expect.anything(),
      { operationId: "operation_1" },
    );
  });

  it("requeues a dependent event when contact sync is still pending", async () => {
    const ctx = createContext(
      {
        _id: "operation_1",
        acceptanceStatus: "notAttempted",
        attemptCount: 0,
        contactId: "contact_1",
        dependsOnOperationId: "dependency_1",
        idempotencyExpiresAt: now + 100_000,
        nextAttemptAt: 0,
        status: "pending",
      },
      {
        _id: "dependency_1",
        leaseExpiresAt: now + 10_000,
        nextAttemptAt: 0,
        status: "claimed",
      },
    );

    await expect(
      getHandler(claimEmailProviderOperation)(ctx, claimArgs),
    ).resolves.toBeNull();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ nextAttemptAt: now + 11_000 }),
    );
    expect(ctx.scheduler.runAt).toHaveBeenCalledWith(
      now + 11_000,
      expect.anything(),
      { operationId: "operation_1" },
    );
  });

  it("recovers an expired started lease as ambiguous without recounting it", async () => {
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "notAttempted",
      attemptCount: 1,
      attemptLeaseOwner: "crashed_worker",
      contactId: "contact_1",
      idempotencyExpiresAt: now + 100_000,
      leaseExpiresAt: now - 1,
      leaseOwner: "crashed_worker",
      nextAttemptAt: 0,
      status: "claimed",
    };
    const ctx = createContext(operation);

    await expect(
      getHandler(claimEmailProviderOperation)(ctx, claimArgs),
    ).resolves.toMatchObject({
      acceptanceStatus: "unknown",
      attemptCount: 1,
      leaseOwner: "worker_1",
      status: "claimed",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        acceptanceStatus: "unknown",
        attemptLeaseOwner: undefined,
      }),
    );
  });

  it("preserves ambiguous acceptance when an expired started lease hits the retry limit", async () => {
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "notAttempted",
      attemptCount: 7,
      attemptLeaseOwner: "crashed_worker",
      contactId: "contact_1",
      idempotencyExpiresAt: now + 100_000,
      leaseExpiresAt: now - 1,
      leaseOwner: "crashed_worker",
      nextAttemptAt: 0,
      status: "claimed",
    };
    const ctx = createContext(operation);

    await expect(
      getHandler(claimEmailProviderOperation)(ctx, claimArgs),
    ).resolves.toBeNull();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        acceptanceStatus: "unknown",
        ambiguousAt: now,
        attemptLeaseOwner: undefined,
        failureCategory: "retryLimit",
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "deadLetter",
      }),
    );
  });
});
