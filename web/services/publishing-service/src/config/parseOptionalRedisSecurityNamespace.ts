import { InvalidRedisSecurityNamespaceError } from "../errors/InvalidRedisSecurityNamespaceError.js";
import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { RedisSecurityNamespace } from "../redis/RedisSecurityNamespace.js";
import { createRedisSecurityNamespace } from "../redis/createRedisSecurityNamespace.js";

export const parseOptionalRedisSecurityNamespace = (
  value: string | undefined,
): RedisSecurityNamespace | undefined => {
  if (value === undefined) {
    return undefined;
  }

  try {
    return createRedisSecurityNamespace(value);
  } catch (error) {
    if (error instanceof InvalidRedisSecurityNamespaceError) {
      throw new PublishingServiceConfigurationError("PUBLISHING_REDIS_NAMESPACE");
    }

    throw error;
  }
};
