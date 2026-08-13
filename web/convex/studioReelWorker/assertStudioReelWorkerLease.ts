import type { Doc } from "../_generated/dataModel";

export function assertStudioReelWorkerLease(
  run: Doc<"studioReelGenerationRuns"> | null,
  input: {
    runAttempt: number;
    leaseAttempt: number;
    leaseId: string;
  },
) {
  if (
    !run ||
    run.attempt !== input.runAttempt ||
    run.workerLeaseAttempt !== input.leaseAttempt ||
    run.workerLeaseId !== input.leaseId ||
    !run.workerLeaseExpiresAt ||
    Date.parse(run.workerLeaseExpiresAt) <= Date.now() ||
    (run.status !== "intentReady" && run.status !== "canceled")
  ) {
    throw new Error("Studio Stitch worker lease is no longer valid.");
  }
  return run;
}
