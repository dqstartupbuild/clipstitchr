import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceRuntimeMode } from "./PublishingServiceRuntimeMode.js";

export const parsePublishingServiceRuntimeMode = (
  value: string | undefined,
): PublishingServiceRuntimeMode => {
  if (value !== "development" && value !== "test" && value !== "production") {
    throw new PublishingServiceConfigurationError("NODE_ENV");
  }

  return value;
};
