import { parsePublishingServiceEnvironment } from "../config/parsePublishingServiceEnvironment.js";
import { createPublishingRuntimeLogger } from "./createPublishingRuntimeLogger.js";
import { runPublishingServiceRuntime } from "./runPublishingServiceRuntime.js";
import { startPublishingServiceRuntime } from "./startPublishingServiceRuntime.js";

export const runPublishingService = async (
  input: NodeJS.ProcessEnv,
): Promise<void> => {
  const logger = createPublishingRuntimeLogger();

  try {
    const environment = parsePublishingServiceEnvironment(input);
    const runtime = await startPublishingServiceRuntime(environment, logger);

    logger.info("publishing_runtime_started", {
      enabledProviders: environment.enabledProviders,
      host: environment.host,
      leaseOwner: runtime.leaseOwner,
      port: environment.port,
    });
    await runPublishingServiceRuntime(runtime, { logger });
  } catch {
    logger.error("publishing_runtime_failed", {
      outcome: "runtime_unavailable",
    });
    throw new Error("Publishing service runtime failed.");
  }
};
