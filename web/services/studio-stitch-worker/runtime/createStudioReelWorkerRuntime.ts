import { createStudioReelWorkerHttpClient } from "../adapters/http/createStudioReelWorkerHttpClient";
import { createStudioReelR2ObjectStore } from "../adapters/r2/createStudioReelR2ObjectStore";
import type { StudioReelWorkerRuntime } from "../contracts/StudioReelWorkerRuntime";
import type { StudioReelWorkerRuntimeConfig } from "../contracts/StudioReelWorkerRuntimeConfig";
import { runStudioReelWorkerOnce } from "./runStudioReelWorkerOnce";
import { runStudioReelWorkerRuntimeLoop } from "./runStudioReelWorkerRuntimeLoop";

export function createStudioReelWorkerRuntime(input: {
  config: StudioReelWorkerRuntimeConfig;
  fetch?: typeof fetch;
}): StudioReelWorkerRuntime {
  const http = createStudioReelWorkerHttpClient({
    config: input.config.coordinator,
    fetch: input.fetch,
  });
  const objects = createStudioReelR2ObjectStore({ config: input.config.r2 });
  const runOnce = runStudioReelWorkerOnce.bind(null, {
    config: input.config,
    fetch: input.fetch,
    http,
    objects,
  });
  return {
    run: runStudioReelWorkerRuntimeLoop.bind(
      null,
      input.config.pollIntervalMs,
      runOnce,
    ),
    runOnce,
  };
}
