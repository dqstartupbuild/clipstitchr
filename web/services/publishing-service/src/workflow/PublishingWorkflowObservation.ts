import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";

export type PublishingWorkflowObservation = Readonly<{
  result: ProviderPublishResult;
  observedAt: Date;
}>;
