import type { Server } from "node:http";
import type { PrismaClient } from "@prisma/client";

import type { PublishingRedisRuntime } from "../redis/PublishingRedisRuntime.js";

export type PublishingServiceRuntimeResources = Readonly<{
  abortController: AbortController;
  database: PrismaClient;
  outboxLoop: Promise<void>;
  redis: PublishingRedisRuntime;
  server: Server;
}>;
