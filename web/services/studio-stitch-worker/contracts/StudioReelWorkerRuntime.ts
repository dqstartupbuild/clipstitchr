import type { StudioReelWorkerClaimResult } from "./StudioReelWorkerClaimResult";

export type StudioReelWorkerRuntime = {
  readonly run: (
    signal: AbortSignal,
    onResult?: (result: StudioReelWorkerClaimResult) => void,
  ) => Promise<void>;
  readonly runOnce: () => Promise<StudioReelWorkerClaimResult>;
};
