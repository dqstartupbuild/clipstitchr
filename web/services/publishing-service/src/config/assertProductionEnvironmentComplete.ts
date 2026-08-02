import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";

const PRODUCTION_FIELDS = [
  ["host", "PUBLISHING_SERVICE_HOST"],
  ["port", "PUBLISHING_SERVICE_PORT"],
  ["serviceIssuer", "PUBLISHING_SERVICE_ISSUER"],
  ["serviceAudience", "PUBLISHING_SERVICE_AUDIENCE"],
  ["serviceAssertionSigningKey", "PUBLISHING_SERVICE_ASSERTION_KEY_BASE64"],
  ["providerTokenCipherKey", "PUBLISHING_TOKEN_KEY_BASE64"],
  ["databaseUrl", "DATABASE_URL"],
  ["redisUrl", "REDIS_URL"],
  ["redisSecurityNamespace", "PUBLISHING_REDIS_NAMESPACE"],
  ["clipStitchrPublicOrigin", "CLIPSTITCHR_PUBLIC_ORIGIN"],
  ["r2AccountId", "R2_ACCOUNT_ID"],
  ["r2BucketName", "R2_BUCKET_NAME"],
  ["r2AccessKeyId", "R2_ACCESS_KEY_ID"],
  ["r2SecretAccessKey", "R2_SECRET_ACCESS_KEY"],
  ["publishingMediaPublicOrigin", "PUBLISHING_MEDIA_PUBLIC_ORIGIN"],
  ["publishingMediaTokenSecret", "PUBLISHING_MEDIA_TOKEN_SECRET"],
  ["publishingMediaQuotaSecret", "PUBLISHING_MEDIA_QUOTA_SECRET"],
] as const satisfies ReadonlyArray<
  readonly [keyof PublishingServiceEnvironment, string]
>;

export const assertProductionEnvironmentComplete = (
  environment: PublishingServiceEnvironment,
): void => {
  if (environment.mode !== "production") {
    return;
  }

  for (const [propertyName, fieldName] of PRODUCTION_FIELDS) {
    if (environment[propertyName] === undefined) {
      throw new PublishingServiceConfigurationError(fieldName);
    }
  }
};
