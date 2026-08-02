import type { PublishingMediaGatewayDependencies } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayDependencies";
import type { PublishingMediaGatewayR2Client } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayR2Client";
import { createPublishingMediaGatewayRateLimiter } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaGatewayRateLimiter";
import { getPublishingMediaPublicOrigin } from "@/lib/clipstitchr/publishing/media/gateway/getPublishingMediaPublicOrigin";
import { getPublishingMediaTokenSecret } from "@/lib/clipstitchr/publishing/media/gateway/getPublishingMediaTokenSecret";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";

export function createPublishingMediaGatewayDependencies(): PublishingMediaGatewayDependencies {
  const r2Environment = getR2Environment();

  return {
    bucketName: r2Environment.bucketName,
    publicOrigin: getPublishingMediaPublicOrigin(),
    r2Client: createR2Client() as PublishingMediaGatewayR2Client,
    rateLimiter: createPublishingMediaGatewayRateLimiter(),
    tokenSecret: getPublishingMediaTokenSecret(),
  };
}
