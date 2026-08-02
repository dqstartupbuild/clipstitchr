import { InvalidRedisSecurityNamespaceError } from "../errors/InvalidRedisSecurityNamespaceError.js";
import type { RedisSecurityNamespace } from "./RedisSecurityNamespace.js";

const REDIS_SECURITY_NAMESPACE_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;

export const createRedisSecurityNamespace = (
  value: string,
): RedisSecurityNamespace => {
  if (!REDIS_SECURITY_NAMESPACE_PATTERN.test(value)) {
    throw new InvalidRedisSecurityNamespaceError();
  }

  return value as RedisSecurityNamespace;
};
