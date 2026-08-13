import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";
import type { StudioReelWorkerRuntimeConfig } from "../../contracts/StudioReelWorkerRuntimeConfig";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelWorkerHttpResponse } from "./readStudioReelWorkerHttpResponse";

const allowedPaths = new Set([
  "/api/studio/stitch/worker/claim",
  "/api/studio/stitch/worker/lease-state",
  "/api/studio/stitch/worker/progress",
  "/api/studio/stitch/worker/checkpoints/save",
  "/api/studio/stitch/worker/checkpoints/get",
  "/api/studio/stitch/worker/cost-reservations",
  "/api/studio/stitch/worker/complete",
  "/api/studio/stitch/worker/fail",
]);

export function createStudioReelWorkerHttpClient(input: {
  config: StudioReelWorkerRuntimeConfig["coordinator"];
  fetch?: typeof fetch;
}): StudioReelWorkerHttpClient {
  const request = input.fetch ?? fetch;
  return {
    post: async (path, body) => {
      if (!allowedPaths.has(path)) {
        throw new StudioReelWorkerError({
          code: "INVALID_COORDINATOR_PATH",
          kind: "permanent",
          publicMessage: "The Studio Stitch coordinator path is invalid.",
        });
      }
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        input.config.requestTimeoutMs,
      );
      try {
        const response = await request(`${input.config.origin}${path}`, {
          body: JSON.stringify(body),
          headers: {
            "content-type": "application/json",
            "x-studio-stitch-worker-secret": input.config.secret,
          },
          method: "POST",
          redirect: "error",
          signal: controller.signal,
        });
        return await readStudioReelWorkerHttpResponse(response);
      } catch (error) {
        if (error instanceof StudioReelWorkerError) throw error;
        throw new StudioReelWorkerError({
          cause: error,
          code: "COORDINATOR_UNAVAILABLE",
          kind: "retryable",
          publicMessage:
            "The Studio Stitch coordinator is temporarily unavailable.",
        });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
