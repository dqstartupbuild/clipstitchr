export function createWorkerQueueEntryId(
  worker: "provider" | "media",
  sourceKind: "provider_job" | "media_job" | "automation_task",
  sourceId: string,
) {
  return `${worker}:${sourceKind}:${sourceId}`;
}
