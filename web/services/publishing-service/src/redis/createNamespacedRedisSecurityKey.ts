import type { RedisSecurityNamespace } from "./RedisSecurityNamespace.js";

export const createNamespacedRedisSecurityKey = (
  namespace: RedisSecurityNamespace,
  logicalKey: string,
): string => `clipstitchr:${namespace}:${logicalKey}`;
