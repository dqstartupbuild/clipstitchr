import type { PublishingServiceRuntimeStopResources } from "./PublishingServiceRuntimeStopResources.js";
import { stopPublishingServiceRuntimeResources } from "./stopPublishingServiceRuntimeResources.js";

export const createPublishingServiceRuntimeStop = (
  resources: PublishingServiceRuntimeStopResources,
): (() => Promise<void>) => {
  let stopTask: Promise<void> | undefined;

  return () => {
    stopTask ??= stopPublishingServiceRuntimeResources(resources);
    return stopTask;
  };
};
