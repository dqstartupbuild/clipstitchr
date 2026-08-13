import { STUDIO_REEL_WORKER_LIMITS } from "../../constants/studioReelWorkerLimits";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelBoundedResponseBody } from "../../security/readStudioReelBoundedResponseBody";

export async function readStudioReelProviderBytes(
  response: Response,
  providerName: string,
  maximumBytes = STUDIO_REEL_WORKER_LIMITS.providerResponseBytes,
) {
  const bytes = await readStudioReelBoundedResponseBody({
    maximumBytes,
    response,
    tooLargeMessage: `${providerName} returned too much data.`,
  });
  if (!response.ok) {
    throw new StudioReelWorkerError({
      code: `${providerName.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_REJECTED`,
      kind: response.status === 408 || response.status === 429 || response.status >= 500
        ? "retryable"
        : "permanent",
      publicMessage: `${providerName} could not complete the Studio Stitch request.`,
    });
  }
  return bytes;
}
