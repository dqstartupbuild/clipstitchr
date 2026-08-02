import { randomUUID } from "node:crypto";

import type { RedisSecurityNamespace } from "../../src/redis/RedisSecurityNamespace.js";
import { createRedisSecurityNamespace } from "../../src/redis/createRedisSecurityNamespace.js";

export const createEphemeralRedisNamespace = (
  label: string,
): RedisSecurityNamespace =>
  createRedisSecurityNamespace(
    `integration-${label}-${randomUUID().replaceAll("-", "")}`,
  );
