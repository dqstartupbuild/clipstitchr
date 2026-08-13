import { describe, expect, it, vi } from "vitest";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";

describe("assertStudioClipsWorkerLease", () => {
  it("accepts only the current unexpired attempt and lease", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T12:00:00.000Z"));
    const task = {
      attempt: 2,
      leaseExpiresAt: "2026-08-12T12:05:00.000Z",
      leaseId: "lease_2",
      status: "processing",
    };
    expect(
      assertStudioClipsWorkerLease(task as never, {
        attempt: 2,
        leaseId: "lease_2",
      }),
    ).toBe(task);
    expect(() =>
      assertStudioClipsWorkerLease(task as never, {
        attempt: 1,
        leaseId: "lease_2",
      }),
    ).toThrow("no longer valid");
    vi.useRealTimers();
  });

  it("rejects expired or queued claims", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T12:06:00.000Z"));
    expect(() =>
      assertStudioClipsWorkerLease(
        {
          attempt: 2,
          leaseExpiresAt: "2026-08-12T12:05:00.000Z",
          leaseId: "lease_2",
          status: "processing",
        } as never,
        { attempt: 2, leaseId: "lease_2" },
      ),
    ).toThrow("no longer valid");
    vi.useRealTimers();
  });
});
