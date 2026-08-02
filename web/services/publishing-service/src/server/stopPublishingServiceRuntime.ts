import type { PublishingServiceRuntimeResources } from "./PublishingServiceRuntimeResources.js";
import { closePublishingHttpServer } from "./closePublishingHttpServer.js";
import { waitForPublishingShutdownTask } from "./waitForPublishingShutdownTask.js";

export const stopPublishingServiceRuntime = async (
  resources: PublishingServiceRuntimeResources,
): Promise<void> => {
  resources.abortController.abort();
  await closePublishingHttpServer(resources.server);
  await waitForPublishingShutdownTask(resources.outboxLoop);
  await Promise.allSettled([
    resources.redis.close(),
    resources.database.$disconnect(),
  ]);
};
