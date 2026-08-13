import type { StudioClipsTaskStatus } from "../contracts/StudioClipsTaskStatus";

const allowedTransitions: Record<
  StudioClipsTaskStatus,
  ReadonlySet<StudioClipsTaskStatus>
> = {
  cancelled: new Set(["queued"]),
  completed: new Set(),
  error: new Set(["queued"]),
  processing: new Set(["cancelled", "completed", "error"]),
  queued: new Set(["cancelled", "error", "processing"]),
};

export function getStudioClipsStatusTransitionIsAllowed(
  from: StudioClipsTaskStatus,
  to: StudioClipsTaskStatus,
): boolean {
  return allowedTransitions[from].has(to);
}
