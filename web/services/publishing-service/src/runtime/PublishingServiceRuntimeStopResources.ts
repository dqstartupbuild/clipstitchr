import type { S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@prisma/client";
import type { Server } from "node:http";

import type { PublishingRedisRuntime } from "../redis/PublishingRedisRuntime.js";

export type PublishingServiceRuntimeStopResources = Readonly<{
  abortController: AbortController;
  database: PrismaClient;
  outboxLoop: Promise<void>;
  r2Client: S3Client;
  redis: PublishingRedisRuntime;
  server: Server;
}>;
