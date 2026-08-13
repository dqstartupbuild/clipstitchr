import { describe, expect, it, vi } from "vitest";
import { createStudioClipsTestClaim } from "../testing/createStudioClipsTestClaim";
import { createStudioClipsLeaseHeartbeat } from "./createStudioClipsLeaseHeartbeat";

describe("createStudioClipsLeaseHeartbeat", () => {
  it("repeats the completed-stage progress while a long operation is active", async () => {
    vi.useFakeTimers();
    const post = vi.fn(async () => ({ accepted: true }));
    const heartbeat = createStudioClipsLeaseHeartbeat({
      claim: createStudioClipsTestClaim(),
      http: { post },
      intervalMs: 1_000,
    });
    let finish: (() => void) | undefined;
    const operation = heartbeat.run({
      checkpoint: "analyzed",
      code: "analyzed",
      operation: () =>
        new Promise<string>((resolve) => {
          finish = () => resolve("done");
        }),
    });

    try {
      await vi.advanceTimersByTimeAsync(2_100);
      expect(post).toHaveBeenCalledTimes(2);
      expect(post).toHaveBeenCalledWith(
        "/api/studio/clips/worker/progress",
        expect.objectContaining({
          event: expect.objectContaining({
            checkpoint: "analyzed",
            code: "analyzed",
            progressPercent: 62,
          }),
        }),
      );
      finish?.();
      await expect(operation).resolves.toBe("done");
    } finally {
      vi.useRealTimers();
    }
  });

  it("waits for an in-flight heartbeat and fails closed before returning", async () => {
    vi.useFakeTimers();
    let rejectHeartbeat: ((error: Error) => void) | undefined;
    const post = vi.fn(
      () =>
        new Promise<unknown>((_resolve, reject) => {
          rejectHeartbeat = reject;
        }),
    );
    const heartbeat = createStudioClipsLeaseHeartbeat({
      claim: createStudioClipsTestClaim(),
      http: { post },
      intervalMs: 1_000,
    });
    let finish: (() => void) | undefined;
    const operation = heartbeat.run({
      checkpoint: "rendered",
      code: "rendered",
      operation: () =>
        new Promise<string>((resolve) => {
          finish = () => resolve("done");
        }),
    });

    try {
      await vi.advanceTimersByTimeAsync(1_000);
      finish?.();
      rejectHeartbeat?.(new Error("lease expired"));
      await expect(operation).rejects.toThrow("lease expired");
    } finally {
      vi.useRealTimers();
    }
  });
});
