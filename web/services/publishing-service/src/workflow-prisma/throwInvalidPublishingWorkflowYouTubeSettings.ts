import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";

export const throwInvalidPublishingWorkflowYouTubeSettings = (): never => {
  throw new ProviderRuntimeError("youtube", "invalid_request");
};
