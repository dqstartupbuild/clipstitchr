import type { Doc } from "../_generated/dataModel";

export function assertStudioClipsWorkerLease(
  task:
    | Doc<"studioClipsTasks">
    | Doc<"studioClipsRenderRevisions">
    | null,
  input: { attempt: number; leaseId: string },
) {
  if (
    !task ||
    task.attempt !== input.attempt ||
    task.leaseId !== input.leaseId ||
    !task.leaseExpiresAt ||
    Date.parse(task.leaseExpiresAt) <= Date.now() ||
    (task.status !== "processing" &&
      task.status !== "error" &&
      task.status !== "cancelled")
  ) {
    throw new Error("Studio Clips worker lease is no longer valid.");
  }
  return task;
}
