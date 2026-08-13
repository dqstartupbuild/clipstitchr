import type { PublishingCompatibilityResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCompatibilityResponse";

export function getPublishingCompatibilityWarningKey(
  compatibility: PublishingCompatibilityResponse | null,
  integrationId: string,
) {
  const destination = compatibility?.destinations.find(
    (item) => item.integrationId === integrationId,
  );
  if (!compatibility || destination?.status !== "warning") {
    return null;
  }
  const issues = destination.issues
    .filter((issue) => issue.severity === "warning")
    .map((issue) => `${issue.code}:${issue.message}`)
    .sort();
  return JSON.stringify([
    compatibility.mediaRevision,
    integrationId,
    ...issues,
  ]);
}
