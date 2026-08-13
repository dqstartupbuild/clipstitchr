import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsWorkerRuntimeConfig } from "../../runtime/StudioClipsWorkerRuntimeConfig";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";
import { readStudioClipsHttpResponse } from "./readStudioClipsHttpResponse";

export function createStudioClipsWorkerHttpClient(input: {
  config: StudioClipsWorkerRuntimeConfig["coordinator"];
  fetch?: typeof fetch;
}): StudioClipsWorkerHttpClient {
  const request = input.fetch ?? fetch;

  return {
    post: async (path, body) => {
      if (!/^\/api\/studio\/clips\/worker\/[a-z0-9/-]+$/.test(path)) {
        throw new StudioClipsWorkerError({
          code: "INVALID_WORKER_API_PATH",
          kind: "permanent",
          publicMessage: "The Studio Clips coordinator path is invalid.",
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
            "x-studio-clips-worker-secret": input.config.secret,
          },
          method: "POST",
          redirect: "error",
          signal: controller.signal,
        });
        return await readStudioClipsHttpResponse(response);
      } catch (error) {
        if (error instanceof StudioClipsWorkerError) throw error;
        throw new StudioClipsWorkerError({
          cause: error,
          code: "WORKER_API_UNAVAILABLE",
          kind: "retryable",
          publicMessage: "The Studio Clips coordinator is temporarily unavailable.",
        });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
