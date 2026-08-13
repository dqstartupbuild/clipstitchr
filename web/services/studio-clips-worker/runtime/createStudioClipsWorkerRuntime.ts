import { createStudioClipsWorkerHttpClient } from "../adapters/http/createStudioClipsWorkerHttpClient";
import { createStudioClipsR2ObjectStore } from "../adapters/r2/createStudioClipsR2ObjectStore";
import type { StudioClipsWorkerRuntime } from "./StudioClipsWorkerRuntime";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import { StudioClipsConfiguredWorkerRuntime } from "./StudioClipsConfiguredWorkerRuntime";

export function createStudioClipsWorkerRuntime(input: {
  config: StudioClipsWorkerRuntimeConfig;
  fetch?: typeof fetch;
}): StudioClipsWorkerRuntime {
  const http = createStudioClipsWorkerHttpClient({
    config: input.config.coordinator,
    fetch: input.fetch,
  });
  const objects = createStudioClipsR2ObjectStore({ config: input.config.r2 });
  return new StudioClipsConfiguredWorkerRuntime({
    config: input.config,
    fetch: input.fetch,
    http,
    objects,
  });
}
