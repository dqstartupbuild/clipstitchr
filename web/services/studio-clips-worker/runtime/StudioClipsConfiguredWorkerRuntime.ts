import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import type { StudioClipsWorkerClaimResult } from "./StudioClipsWorkerClaimResult";
import type { StudioClipsWorkerRuntime } from "./StudioClipsWorkerRuntime";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import { runStudioClipsWorkerLoop } from "./runStudioClipsWorkerLoop";
import { runStudioClipsWorkerOnce } from "./runStudioClipsWorkerOnce";

export class StudioClipsConfiguredWorkerRuntime implements StudioClipsWorkerRuntime {
  readonly #config: StudioClipsWorkerRuntimeConfig;
  readonly #fetch: typeof fetch | undefined;
  readonly #http: StudioClipsWorkerHttpClient;
  readonly #objects: StudioClipsR2ObjectStore;

  constructor(input: {
    config: StudioClipsWorkerRuntimeConfig;
    fetch?: typeof fetch;
    http: StudioClipsWorkerHttpClient;
    objects: StudioClipsR2ObjectStore;
  }) {
    this.#config = input.config;
    this.#fetch = input.fetch;
    this.#http = input.http;
    this.#objects = input.objects;
  }

  run(
    signal: AbortSignal,
    onResult?: (result: StudioClipsWorkerClaimResult) => void,
  ): Promise<void> {
    return runStudioClipsWorkerLoop({
      onResult,
      pollIntervalMs: this.#config.pollIntervalMs,
      runOnce: () => this.runOnce(),
      signal,
    });
  }

  runOnce(): Promise<StudioClipsWorkerClaimResult> {
    return runStudioClipsWorkerOnce({
      config: this.#config,
      fetch: this.#fetch,
      http: this.#http,
      objects: this.#objects,
    });
  }
}
