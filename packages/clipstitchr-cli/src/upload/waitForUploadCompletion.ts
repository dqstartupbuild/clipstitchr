import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { getUploadStatus } from "../api/getUploadStatus.js";
import { waitForMilliseconds } from "../utils/waitForMilliseconds.js";

const defaultTimeoutMs = 10 * 60 * 1000;
const pollIntervalMs = 3000;

export async function waitForUploadCompletion(
  credentials: ClipstitchrCredentials,
  clipId: string,
  timeoutMs = defaultTimeoutMs,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const status = await getUploadStatus(credentials, clipId);

    if (status.clip) {
      return status;
    }

    if (status.job?.status === "failed") {
      throw new Error(status.job.error ?? "Demo processing failed.");
    }

    await waitForMilliseconds(pollIntervalMs);
  }

  throw new Error("Demo upload is still processing. Check your Library soon.");
}
