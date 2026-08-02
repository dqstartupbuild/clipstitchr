import type { PublishingProviderRuntime } from "../provider-runtime/registry/PublishingProviderRuntime.js";
import type { PublishingWorkflowPort } from "./PublishingWorkflowPort.js";

export type PublishingWorkflowHandlerOptions = Readonly<{
  port: PublishingWorkflowPort;
  providerRuntimes: ReadonlyMap<string, PublishingProviderRuntime>;
  now?: () => Date;
}>;
