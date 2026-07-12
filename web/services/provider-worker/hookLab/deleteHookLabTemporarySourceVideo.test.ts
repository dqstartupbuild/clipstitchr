import { describe, expect, it, vi } from "vitest";
import { deleteHookLabTemporarySourceVideo } from "./deleteHookLabTemporarySourceVideo";

describe("deleteHookLabTemporarySourceVideo", () => {
  it("retries bounded transient failures before succeeding", async () => {
    const deleteObject = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary outage"))
      .mockRejectedValueOnce(new Error("temporary outage"))
      .mockResolvedValueOnce(undefined);
    const waitForRetry = vi.fn().mockResolvedValue(undefined);

    await deleteHookLabTemporarySourceVideo({
      deleteObject,
      objectKey: "users/owner/hook-lab-sources/job/source.mp4",
      waitForRetry,
    });

    expect(deleteObject).toHaveBeenCalledTimes(3);
    expect(waitForRetry).toHaveBeenNthCalledWith(1, 100);
    expect(waitForRetry).toHaveBeenNthCalledWith(2, 200);
  });

  it("returns a sanitized failure after the bounded attempts are exhausted", async () => {
    const deleteObject = vi.fn().mockRejectedValue(
      new Error("request signature abc-secret was rejected"),
    );
    const waitForRetry = vi.fn().mockResolvedValue(undefined);
    let cleanupError: unknown;

    try {
      await deleteHookLabTemporarySourceVideo({
        deleteObject,
        objectKey: "users/owner/hook-lab-sources/job/source.mp4",
        waitForRetry,
      });
    } catch (error) {
      cleanupError = error;
    }

    expect(cleanupError).toEqual(
      new Error("Unable to delete the temporary Hook Lab source video."),
    );
    expect(String(cleanupError)).not.toContain("abc-secret");
    expect(deleteObject).toHaveBeenCalledTimes(3);
    expect(waitForRetry).toHaveBeenCalledTimes(2);
  });

  it("aborts and bounds every stalled delete attempt", async () => {
    const signals: AbortSignal[] = [];
    const deleteObject = vi.fn(
      async (_key: string, abortSignal: AbortSignal) => {
        signals.push(abortSignal);

        await new Promise(() => undefined);
      },
    );
    const waitForRetry = vi.fn().mockResolvedValue(undefined);

    await expect(
      deleteHookLabTemporarySourceVideo({
        attemptTimeoutMs: 1,
        deleteObject,
        objectKey: "users/owner/hook-lab-sources/job/source.mp4",
        waitForRetry,
      }),
    ).rejects.toThrow("Unable to delete the temporary Hook Lab source video.");
    expect(deleteObject).toHaveBeenCalledTimes(3);
    expect(signals).toHaveLength(3);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });
});
