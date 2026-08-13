import type { StudioClipsTaskStatus } from "./StudioClipsTaskStatus";

export function getStudioClipsTaskIsActive(status: StudioClipsTaskStatus) {
  return status === "queued" || status === "processing";
}
