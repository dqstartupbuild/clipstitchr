import type { PublishingMediaGatewayR2Client } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayR2Client";
import type { PublishingMediaGatewayRateLimiter } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayRateLimiter";

export type PublishingMediaGatewayDependencies = {
  bucketName: string;
  nowEpochMs?: () => number;
  publicOrigin: string;
  r2Client: PublishingMediaGatewayR2Client;
  rateLimiter: PublishingMediaGatewayRateLimiter;
  tokenSecret: string;
};
