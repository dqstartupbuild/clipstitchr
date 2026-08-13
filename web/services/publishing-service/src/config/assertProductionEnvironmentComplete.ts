import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";

const PRODUCTION_FIELDS = [
  ["host", "STUDIO_PUBLISHING_SERVICE_HOST"],
  ["port", "STUDIO_PUBLISHING_SERVICE_PORT"],
  ["serviceIssuer", "STUDIO_PUBLISHING_SERVICE_ISSUER"],
  ["serviceAudience", "STUDIO_PUBLISHING_SERVICE_AUDIENCE"],
  ["serviceAssertionSigningKey", "STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64"],
  ["dispatchAccessSecret", "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET"],
  ["providerTokenCipherKey", "STUDIO_PUBLISHING_TOKEN_KEY_BASE64"],
  ["databaseUrl", "STUDIO_PUBLISHING_DATABASE_URL"],
  ["redisUrl", "STUDIO_PUBLISHING_REDIS_URL"],
  ["redisSecurityNamespace", "STUDIO_PUBLISHING_REDIS_NAMESPACE"],
  ["clipStitchrPublicOrigin", "STUDIO_PUBLISHING_APP_ORIGIN"],
  ["r2AccountId", "STUDIO_PUBLISHING_R2_ACCOUNT_ID"],
  ["r2BucketName", "STUDIO_PUBLISHING_R2_BUCKET_NAME"],
  ["r2AccessKeyId", "STUDIO_PUBLISHING_R2_ACCESS_KEY_ID"],
  ["r2SecretAccessKey", "STUDIO_PUBLISHING_R2_SECRET_ACCESS_KEY"],
  ["publishingMediaPublicOrigin", "STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN"],
  ["publishingMediaTokenSecret", "STUDIO_PUBLISHING_MEDIA_TOKEN_SECRET"],
  ["publishingMediaQuotaSecret", "STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET"],
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
