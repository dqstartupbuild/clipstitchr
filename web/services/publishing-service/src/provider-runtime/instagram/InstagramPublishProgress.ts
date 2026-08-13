import type { ProviderPublishResult } from "../contracts/ProviderPublishResult.js";
import type { InstagramPublishCheckpoint } from "./InstagramPublishCheckpoint.js";

export type InstagramPublishProgress = Readonly<{
  checkpoint: InstagramPublishCheckpoint;
  result: ProviderPublishResult;
}>;
