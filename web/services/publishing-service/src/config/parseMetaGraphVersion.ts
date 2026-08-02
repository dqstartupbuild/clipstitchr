import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { MetaGraphVersion } from "../provider-runtime/instagram/MetaGraphVersion.js";

export const parseMetaGraphVersion = (
  value: string | undefined,
): MetaGraphVersion | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (!/^v\d{1,2}\.\d+$/.test(value)) {
    throw new PublishingServiceConfigurationError("META_GRAPH_API_VERSION");
  }
  return value as MetaGraphVersion;
};
