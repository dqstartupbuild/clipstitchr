import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";

export const throwInvalidStoredPublishingWorkflowCheckpoint = (): never => {
  throw new ProviderRuntimeError("instagram", "invalid_request");
};
