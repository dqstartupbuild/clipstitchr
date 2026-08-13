import { STUDIO_REEL_WORKER_LIMITS } from "../../constants/studioReelWorkerLimits";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelBoundedResponseBody } from "../../security/readStudioReelBoundedResponseBody";
import { getStudioReelCoordinatorPublicMessage } from "./getStudioReelCoordinatorPublicMessage";

export async function readStudioReelWorkerHttpResponse(response: Response) {
  const bytes = await readStudioReelBoundedResponseBody({
    maximumBytes: STUDIO_REEL_WORKER_LIMITS.coordinatorResponseBytes,
    response,
    tooLargeMessage: "The Studio Stitch coordinator response was too large.",
  });
  let value: unknown;
  try {
    value = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
  } catch {
    value = null;
  }
  if (!response.ok) {
    throw new StudioReelWorkerError({
      code:
        response.status === 401
          ? "COORDINATOR_AUTH_REJECTED"
          : response.status === 409
            ? "COORDINATOR_CONFLICT"
            : response.status === 429
              ? "COORDINATOR_RATE_LIMITED"
              : "COORDINATOR_REJECTED",
      kind:
        response.status === 429 || response.status >= 500
          ? "retryable"
          : "permanent",
      publicMessage: getStudioReelCoordinatorPublicMessage(response.status),
    });
  }
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new StudioReelWorkerError({
      code: "INVALID_COORDINATOR_RESPONSE",
      kind: "permanent",
      publicMessage: "The Studio Stitch coordinator response was invalid.",
    });
  }
  return value as Record<string, unknown>;
}
