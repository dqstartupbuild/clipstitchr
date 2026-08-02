import type { PublishingServiceEnvironment } from "../config/PublishingServiceEnvironment.js";

type RequiredPublishingRuntimeFields =
  | "clipStitchrPublicOrigin"
  | "databaseUrl"
  | "host"
  | "port"
  | "providerTokenCipherKey"
  | "publishingMediaPublicOrigin"
  | "publishingMediaQuotaSecret"
  | "publishingMediaTokenSecret"
  | "r2AccessKeyId"
  | "r2AccountId"
  | "r2BucketName"
  | "r2SecretAccessKey"
  | "redisSecurityNamespace"
  | "redisUrl"
  | "serviceAssertionSigningKey"
  | "serviceAudience"
  | "serviceIssuer";

export type PublishingServiceRuntimeConfiguration =
  Omit<PublishingServiceEnvironment, RequiredPublishingRuntimeFields> &
    Readonly<{
      [Field in RequiredPublishingRuntimeFields]-?: Exclude<
        PublishingServiceEnvironment[Field],
        undefined
      >;
    }>;
