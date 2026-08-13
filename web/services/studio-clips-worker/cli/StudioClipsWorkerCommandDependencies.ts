import type { StudioClipsWorkerRuntime } from "../runtime/StudioClipsWorkerRuntime";
import type { StudioClipsWorkerRuntimeConfig } from "../runtime/StudioClipsWorkerRuntimeConfig";

export type StudioClipsWorkerCommandDependencies = {
  createRuntime?: (input: {
    config: StudioClipsWorkerRuntimeConfig;
  }) => StudioClipsWorkerRuntime;
  environment?: NodeJS.ProcessEnv;
  signal?: AbortSignal;
};
