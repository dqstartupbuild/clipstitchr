import type { PublishingProviderRuntime } from "../provider-runtime/registry/PublishingProviderRuntime.js";
import type { PublishingDispatchAccessAuthorizer } from "../dispatch-access/PublishingDispatchAccessAuthorizer.js";
import type { PublishingWorkflowPort } from "./PublishingWorkflowPort.js";

export type PublishingWorkflowHandlerOptions = Readonly<{
  authorizeDispatch: PublishingDispatchAccessAuthorizer;
  port: PublishingWorkflowPort;
  providerRuntimes: ReadonlyMap<string, PublishingProviderRuntime>;
  now?: () => Date;
}>;
