import type { ApifyActorRun } from "@/lib/clipstitchr/types/ApifyActorRun";

export function parseApifyActorRun(input: unknown): ApifyActorRun {
  const container =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : null;
  const data =
    container?.data &&
    typeof container.data === "object" &&
    !Array.isArray(container.data)
      ? (container.data as Record<string, unknown>)
      : container;
  const allowedStatuses = new Set<ApifyActorRun["status"]>([
    "READY",
    "RUNNING",
    "SUCCEEDED",
    "FAILED",
    "TIMING-OUT",
    "TIMED-OUT",
    "ABORTING",
    "ABORTED",
  ]);
  const id = typeof data?.id === "string" ? data.id.trim() : "";
  const status =
    typeof data?.status === "string"
      ? (data.status.trim().toUpperCase() as ApifyActorRun["status"])
      : undefined;

  if (!id || !status || !allowedStatuses.has(status)) {
    throw new Error("Apify returned an invalid Actor run.");
  }

  return {
    id,
    status,
    ...(typeof data?.defaultDatasetId === "string" && data.defaultDatasetId.trim()
      ? { defaultDatasetId: data.defaultDatasetId.trim() }
      : {}),
    ...(typeof data?.startedAt === "string" && data.startedAt.trim()
      ? { startedAt: data.startedAt.trim() }
      : {}),
    ...(typeof data?.finishedAt === "string" && data.finishedAt.trim()
      ? { finishedAt: data.finishedAt.trim() }
      : {}),
  };
}
