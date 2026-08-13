import { createPublishingShutdownSignalWaiter } from "./createPublishingShutdownSignalWaiter.js";
import type { PublishingServiceRuntime } from "./PublishingServiceRuntime.js";
import type { PublishingServiceRuntimeRunnerOptions } from "./PublishingServiceRuntimeRunnerOptions.js";
import { waitForPublishingRuntimeStop } from "./waitForPublishingRuntimeStop.js";

export const runPublishingServiceRuntime = async (
  runtime: PublishingServiceRuntime,
  options: PublishingServiceRuntimeRunnerOptions,
): Promise<void> => {
  const signalWaiter = createPublishingShutdownSignalWaiter(
    options.signalSource ?? process,
  );
  const outboxOutcome = runtime.outboxLoop.then(
    () => "outbox_stopped" as const,
    () => "outbox_failed" as const,
  );
  const signalOutcome = signalWaiter.promise.then((signal) => ({
    kind: "signal" as const,
    signal,
  }));
  const loopOutcome = outboxOutcome.then((kind) => ({ kind }));
  const outcome = await Promise.race([signalOutcome, loopOutcome]);

  signalWaiter.dispose();

  if (outcome.kind === "signal") {
    options.logger.info("publishing_runtime_stopping", {
      leaseOwner: runtime.leaseOwner,
      signal: outcome.signal,
    });
  } else {
    options.logger.error("publishing_outbox_loop_fatal", {
      leaseOwner: runtime.leaseOwner,
      outcome: outcome.kind,
    });
  }

  const stopOutcome = await waitForPublishingRuntimeStop(
    runtime.stop(),
    options.shutdownTimeoutMilliseconds ?? 15_000,
  );

  if (stopOutcome !== "stopped") {
    options.logger.error("publishing_runtime_stop_failed", {
      leaseOwner: runtime.leaseOwner,
      outcome: stopOutcome,
    });
    throw new Error("Publishing service shutdown did not complete.");
  }

  options.logger.info("publishing_runtime_stopped", {
    leaseOwner: runtime.leaseOwner,
  });

  if (outcome.kind !== "signal") {
    throw new Error("Publishing outbox loop terminated unexpectedly.");
  }
};
