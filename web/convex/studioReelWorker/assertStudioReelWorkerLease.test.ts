import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";

const run = {
  attempt: 2,
  status: "intentReady",
  workerLeaseAttempt: 3,
  workerLeaseExpiresAt: "2999-01-01T00:00:00.000Z",
  workerLeaseId: "lease_exact",
} as unknown as Doc<"studioReelGenerationRuns">;

describe("assertStudioReelWorkerLease", () => {
  it("accepts only the current exact unexpired lease", () => {
    expect(
      assertStudioReelWorkerLease(run, {
        leaseAttempt: 3,
        leaseId: "lease_exact",
        runAttempt: 2,
      }),
    ).toBe(run);
    expect(() =>
      assertStudioReelWorkerLease(run, {
        leaseAttempt: 3,
        leaseId: "lease_other",
        runAttempt: 2,
      }),
    ).toThrow("no longer valid");
  });

  it("rejects stale attempts, expired leases, and completed states", () => {
    expect(() =>
      assertStudioReelWorkerLease(run, {
        leaseAttempt: 3,
        leaseId: "lease_exact",
        runAttempt: 1,
      }),
    ).toThrow("no longer valid");
    expect(() =>
      assertStudioReelWorkerLease(
        { ...run, workerLeaseExpiresAt: "2000-01-01T00:00:00.000Z" },
        { leaseAttempt: 3, leaseId: "lease_exact", runAttempt: 2 },
      ),
    ).toThrow("no longer valid");
    expect(() =>
      assertStudioReelWorkerLease(
        { ...run, status: "completed" },
        { leaseAttempt: 3, leaseId: "lease_exact", runAttempt: 2 },
      ),
    ).toThrow("no longer valid");
  });
});
