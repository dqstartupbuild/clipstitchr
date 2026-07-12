import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { waitForMilliseconds } from "@/lib/clipstitchr/utils/waitForMilliseconds";

type DeleteHookLabTemporarySourceVideoOptions = {
  attemptTimeoutMs?: number;
  deleteObject?: (key: string, abortSignal: AbortSignal) => Promise<unknown>;
  objectKey: string;
  waitForRetry?: (milliseconds: number) => Promise<unknown>;
};

const MAX_DELETE_ATTEMPTS = 3;
const DELETE_RETRY_DELAY_MS = 100;
const DELETE_ATTEMPT_TIMEOUT_MS = 10_000;

export async function deleteHookLabTemporarySourceVideo({
  attemptTimeoutMs = DELETE_ATTEMPT_TIMEOUT_MS,
  deleteObject = (key, abortSignal) =>
    deleteR2Object(key, { abortSignal }),
  objectKey,
  waitForRetry = waitForMilliseconds,
}: DeleteHookLabTemporarySourceVideoOptions) {
  for (let attempt = 1; attempt <= MAX_DELETE_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        deleteObject(objectKey, controller.signal),
        new Promise<never>((_resolve, reject) => {
          timeout = setTimeout(() => {
            controller.abort();
            reject(
              new Error("The temporary Hook Lab source delete timed out."),
            );
          }, attemptTimeoutMs);
        }),
      ]);
      return;
    } catch {
      if (attempt === MAX_DELETE_ATTEMPTS) {
        throw new Error("Unable to delete the temporary Hook Lab source video.");
      }

      await waitForRetry(DELETE_RETRY_DELAY_MS * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
}
