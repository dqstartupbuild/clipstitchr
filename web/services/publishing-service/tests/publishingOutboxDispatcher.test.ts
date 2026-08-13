import type { LeasedPublishingOutboxRecord } from "../src/persistence/LeasedPublishingOutboxRecord.js";
import { PublishingOutboxDispatcher } from "../src/outbox/PublishingOutboxDispatcher.js";
import type { PublishingOutboxStore } from "../src/outbox/PublishingOutboxStore.js";
import { calculatePublishingOutboxRetryDate } from "../src/outbox/calculatePublishingOutboxRetryDate.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const record = (deliveryAttempts: number): LeasedPublishingOutboxRecord => ({
  id: "outbox_1",
  tenantId: "tenant_1",
  postStateId: "state_1",
  workflowId: "workflow_1",
  eventType: "publishing.destination.requested",
  eventVersion: 1,
  payload: { schemaVersion: 1 },
  status: "LEASED",
  availableAt: new Date("2026-08-02T00:00:00.000Z"),
  leaseOwner: "worker_1",
  leaseExpiresAt: new Date("2026-08-02T00:01:00.000Z"),
  deliveryAttempts,
  createdAt: new Date("2026-08-02T00:00:00.000Z"),
  updatedAt: new Date("2026-08-02T00:00:00.000Z"),
});

const logger = {
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const createStore = (
  leased: readonly LeasedPublishingOutboxRecord[],
): PublishingOutboxStore => ({
  lease: vi.fn(async () => leased),
  markDelivered: vi.fn(async () => undefined),
  reschedule: vi.fn(async () => undefined),
  markDeadLetter: vi.fn(async () => undefined),
});

describe("PublishingOutboxDispatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks an explicitly completed record delivered", async () => {
    const store = createStore([record(1)]);
    const now = new Date("2026-08-02T00:00:10.000Z");
    const dispatcher = new PublishingOutboxDispatcher({
      leaseOwner: "worker_1",
      leaseLimit: 10,
      concurrency: 2,
      leaseDurationMilliseconds: 60_000,
      maximumDeliveryAttempts: 5,
      store,
      handler: vi.fn(async () => ({ kind: "complete" as const })),
      logger,
      now: () => now,
    });

    await expect(
      dispatcher.dispatchOnce(new AbortController().signal),
    ).resolves.toBe(1);
    expect(store.markDelivered).toHaveBeenCalledWith({
      outboxId: "outbox_1",
      leaseOwner: "worker_1",
      deliveredAt: now,
    });
    expect(store.reschedule).not.toHaveBeenCalled();
  });

  it("honors a workflow-provided retry time", async () => {
    const store = createStore([record(2)]);
    const availableAt = new Date("2026-08-02T00:04:00.000Z");
    const dispatcher = new PublishingOutboxDispatcher({
      leaseOwner: "worker_1",
      leaseLimit: 10,
      concurrency: 1,
      leaseDurationMilliseconds: 60_000,
      maximumDeliveryAttempts: 5,
      store,
      handler: vi.fn(async () => ({
        kind: "retry" as const,
        availableAt,
        safeErrorCode: "provider_processing",
      })),
      logger,
      now: () => new Date("2026-08-02T00:00:10.000Z"),
    });

    await dispatcher.dispatchOnce(new AbortController().signal);
    expect(store.reschedule).toHaveBeenCalledWith(
      expect.objectContaining({
        outboxId: "outbox_1",
        availableAt,
        safeErrorCode: "provider_processing",
      }),
    );
  });

  it("converts unknown handler failures into bounded safe retries", async () => {
    const store = createStore([record(1)]);
    const now = new Date("2026-08-02T00:00:10.000Z");
    const dispatcher = new PublishingOutboxDispatcher({
      leaseOwner: "worker_1",
      leaseLimit: 10,
      concurrency: 1,
      leaseDurationMilliseconds: 60_000,
      maximumDeliveryAttempts: 5,
      store,
      handler: vi.fn(async () => {
        throw new Error("Bearer secret-would-be-here");
      }),
      logger,
      now: () => now,
    });

    await dispatcher.dispatchOnce(new AbortController().signal);
    expect(store.reschedule).toHaveBeenCalledWith({
      outboxId: "outbox_1",
      leaseOwner: "worker_1",
      availableAt: new Date("2026-08-02T00:00:15.000Z"),
      safeErrorCode: "worker_unavailable",
      rescheduledAt: now,
    });
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain("secret-would-be-here");
  });

  it("dead-letters work after the configured attempt ceiling", async () => {
    const store = createStore([record(5)]);
    const dispatcher = new PublishingOutboxDispatcher({
      leaseOwner: "worker_1",
      leaseLimit: 10,
      concurrency: 1,
      leaseDurationMilliseconds: 60_000,
      maximumDeliveryAttempts: 5,
      store,
      handler: vi.fn(async () => {
        throw new Error("still unavailable");
      }),
      logger,
      now: () => new Date("2026-08-02T00:00:10.000Z"),
    });

    await dispatcher.dispatchOnce(new AbortController().signal);
    expect(store.markDeadLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        outboxId: "outbox_1",
        safeErrorCode: "delivery_attempts_exhausted",
      }),
    );
    expect(store.reschedule).not.toHaveBeenCalled();
  });

  it("does not lease new work after shutdown begins", async () => {
    const store = createStore([record(1)]);
    const dispatcher = new PublishingOutboxDispatcher({
      leaseOwner: "worker_1",
      leaseLimit: 10,
      concurrency: 1,
      leaseDurationMilliseconds: 60_000,
      maximumDeliveryAttempts: 5,
      store,
      handler: vi.fn(async () => ({ kind: "complete" as const })),
      logger,
    });
    const controller = new AbortController();
    controller.abort();

    await expect(dispatcher.dispatchOnce(controller.signal)).resolves.toBe(0);
    expect(store.lease).not.toHaveBeenCalled();
  });
});

describe("calculatePublishingOutboxRetryDate", () => {
  it("uses bounded exponential backoff", () => {
    const now = new Date("2026-08-02T00:00:00.000Z");

    expect(calculatePublishingOutboxRetryDate(now, 1)).toEqual(
      new Date("2026-08-02T00:00:05.000Z"),
    );
    expect(calculatePublishingOutboxRetryDate(now, 30)).toEqual(
      new Date("2026-08-02T00:15:00.000Z"),
    );
  });
});
