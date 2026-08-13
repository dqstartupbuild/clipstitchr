import type { StudioClipsWorkerClaimResult } from "./StudioClipsWorkerClaimResult";

export type StudioClipsWorkerRuntime = {
  run: (
    signal: AbortSignal,
    onResult?: (result: StudioClipsWorkerClaimResult) => void,
  ) => Promise<void>;
  runOnce: () => Promise<StudioClipsWorkerClaimResult>;
};
