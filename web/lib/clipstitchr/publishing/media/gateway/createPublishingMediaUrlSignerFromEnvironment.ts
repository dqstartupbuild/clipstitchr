import { createPublishingMediaUrlSigner } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaUrlSigner";
import { getPublishingMediaPublicOrigin } from "@/lib/clipstitchr/publishing/media/gateway/getPublishingMediaPublicOrigin";
import { getPublishingMediaTokenSecret } from "@/lib/clipstitchr/publishing/media/gateway/getPublishingMediaTokenSecret";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";

export function createPublishingMediaUrlSignerFromEnvironment() {
  const environment = getR2Environment();

  return createPublishingMediaUrlSigner({
    bucketName: environment.bucketName,
    headClient: createR2Client(),
    publicOrigin: getPublishingMediaPublicOrigin(),
    tokenSecret: getPublishingMediaTokenSecret(),
  });
}
