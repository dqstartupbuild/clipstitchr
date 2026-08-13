import { closePublishingHttpServer } from "../server/closePublishingHttpServer.js";
import { waitForPublishingShutdownTask } from "../server/waitForPublishingShutdownTask.js";
import type { PublishingServiceRuntimeStopResources } from "./PublishingServiceRuntimeStopResources.js";

export const stopPublishingServiceRuntimeResources = async (
  resources: PublishingServiceRuntimeStopResources,
): Promise<void> => {
  resources.abortController.abort();
  await closePublishingHttpServer(resources.server);
  await waitForPublishingShutdownTask(resources.outboxLoop);
  resources.r2Client.destroy();
  await Promise.allSettled([
    resources.redis.close(),
    resources.database.$disconnect(),
  ]);
};
