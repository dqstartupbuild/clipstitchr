import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { StructuredLogger } from "../src/logging/StructuredLogger.js";
import type { PublishingRuntimeSignalSource } from "../src/runtime/PublishingRuntimeSignalSource.js";
import type { PublishingServiceRuntime } from "../src/runtime/PublishingServiceRuntime.js";
import { runPublishingServiceRuntime } from "../src/runtime/runPublishingServiceRuntime.js";
import { waitForPublishingRuntimeStop } from "../src/runtime/waitForPublishingRuntimeStop.js";

const createLogger = (): StructuredLogger => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
});

describe("publishing runtime lifecycle", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stops once after SIGTERM and removes both signal listeners", async () => {
    const signalSource = new EventEmitter();
    const stop = vi.fn(async () => undefined);
    const runtime: PublishingServiceRuntime = {
      leaseOwner: "publishing-service:42:6ba7b810-9dad-41d1-80b4-00c04fd430c8",
      outboxLoop: new Promise(() => undefined),
      stop,
    };
    const logger = createLogger();
    const running = runPublishingServiceRuntime(runtime, {
      logger,
      signalSource: signalSource as PublishingRuntimeSignalSource,
    });

    signalSource.emit("SIGTERM");

    await expect(running).resolves.toBeUndefined();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(signalSource.listenerCount("SIGINT")).toBe(0);
    expect(signalSource.listenerCount("SIGTERM")).toBe(0);
    expect(logger.info).toHaveBeenCalledWith(
      "publishing_runtime_stopping",
      expect.objectContaining({ signal: "SIGTERM" }),
    );
  });

  it("treats a rejected outbox loop as fatal and still stops resources", async () => {
    const stop = vi.fn(async () => undefined);
    const logger = createLogger();
    const runtime: PublishingServiceRuntime = {
      leaseOwner: "publishing-service:42:6ba7b810-9dad-41d1-80b4-00c04fd430c8",
      outboxLoop: Promise.reject(new Error("Bearer secret-must-not-log")),
      stop,
    };

    await expect(
      runPublishingServiceRuntime(runtime, {
        logger,
        signalSource: new EventEmitter() as PublishingRuntimeSignalSource,
      }),
    ).rejects.toThrow("outbox loop terminated");
    expect(stop).toHaveBeenCalledTimes(1);
    expect(JSON.stringify((logger.error as ReturnType<typeof vi.fn>).mock.calls)).not.toContain(
      "secret-must-not-log",
    );
  });

  it("bounds a stop task that never settles", async () => {
    vi.useFakeTimers();
    const result = waitForPublishingRuntimeStop(
      new Promise(() => undefined),
      1_000,
    );

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(result).resolves.toBe("timed_out");
  });
});
