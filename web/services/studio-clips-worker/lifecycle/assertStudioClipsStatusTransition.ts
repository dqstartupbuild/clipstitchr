import type { StudioClipsTaskStatus } from "../contracts/StudioClipsTaskStatus";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { getStudioClipsStatusTransitionIsAllowed } from "./getStudioClipsStatusTransitionIsAllowed";

export function assertStudioClipsStatusTransition(
  from: StudioClipsTaskStatus,
  to: StudioClipsTaskStatus,
): void {
  if (!getStudioClipsStatusTransitionIsAllowed(from, to)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_LIFECYCLE_TRANSITION",
      kind: "permanent",
      publicMessage: `Studio Clips cannot move from ${from} to ${to}.`,
    });
  }
}
