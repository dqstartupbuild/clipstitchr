import type { ReadinessDependency } from "../health/ReadinessDependency.js";
import type { PublishingRedisRuntime } from "./PublishingRedisRuntime.js";

export const createPublishingRedisReadinessDependency = (
  runtime: PublishingRedisRuntime,
): ReadinessDependency =>
  Object.freeze({
    name: "redis",
    check: () => runtime.assertReady(),
  });
