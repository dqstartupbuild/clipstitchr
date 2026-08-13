ALTER TYPE "ClipPublishingProvider" ADD VALUE IF NOT EXISTS 'YOUTUBE';
ALTER TYPE "ClipPublishingSourceKind" ADD VALUE IF NOT EXISTS 'STUDIO_CLIP_OUTPUT';
ALTER TYPE "ClipPublishingSourceKind" ADD VALUE IF NOT EXISTS 'STUDIO_STITCH_OUTPUT';
ALTER TYPE "ClipPublishingProviderOperation" ADD VALUE IF NOT EXISTS 'YOUTUBE_RESUMABLE_UPLOAD';

ALTER TABLE "ClipPublishingPostState" ADD COLUMN "productId" TEXT;

DROP INDEX "ClipPublishingPostState_idempotency_key";
DROP INDEX "ClipPublishingPostState_state_idx";

CREATE UNIQUE INDEX "ClipPublishingPostState_product_idempotency_key"
ON "ClipPublishingPostState"("tenantId", "productId", "integrationId", "idempotencyKey");

CREATE INDEX "ClipPublishingPostState_product_state_idx"
ON "ClipPublishingPostState"("tenantId", "productId", "internalState", "createdAt");

CREATE OR REPLACE FUNCTION "ClipPublishingGuardIntegrationSecretTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_secret_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingTenant" tenant
    JOIN "Integration" integration
      ON integration."organizationId" = tenant."organizationId"
    WHERE tenant."id" = NEW."tenantId"
      AND integration."id" = NEW."integrationId"
      AND integration."providerIdentifier" = CASE NEW."providerIdentifier"
        WHEN 'INSTAGRAM' THEN 'instagram'
        WHEN 'INSTAGRAM_STANDALONE' THEN 'instagram-standalone'
        WHEN 'TIKTOK' THEN 'tiktok'
        WHEN 'YOUTUBE' THEN 'youtube'
      END
  ) THEN
    RAISE EXCEPTION 'ClipPublishingIntegrationSecret tenant/provider mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_secret_tenant$;

CREATE OR REPLACE FUNCTION "ClipPublishingGuardReceiptTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_receipt_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingPostState" post_state
    JOIN "Integration" integration
      ON integration."id" = post_state."integrationId"
    WHERE post_state."id" = NEW."postStateId"
      AND post_state."tenantId" = NEW."tenantId"
      AND integration."providerIdentifier" = CASE NEW."providerIdentifier"
        WHEN 'INSTAGRAM' THEN 'instagram'
        WHEN 'INSTAGRAM_STANDALONE' THEN 'instagram-standalone'
        WHEN 'TIKTOK' THEN 'tiktok'
        WHEN 'YOUTUBE' THEN 'youtube'
      END
  ) OR (
    NEW."attemptId" IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM "ClipPublishingAttempt" attempt
      WHERE attempt."id" = NEW."attemptId"
        AND attempt."tenantId" = NEW."tenantId"
        AND attempt."postStateId" = NEW."postStateId"
    )
  ) THEN
    RAISE EXCEPTION 'ClipPublishingReceipt tenant/provider mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_receipt_tenant$;

CREATE OR REPLACE FUNCTION "ClipPublishingEnforceReceiptPublications"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_receipt_publications$
BEGIN
  IF NEW."resultClass" = 'PUBLISHED'
    AND NEW."providerIdentifier"::text IN (
      'INSTAGRAM',
      'INSTAGRAM_STANDALONE',
      'YOUTUBE'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "ClipPublishingReceiptPublication" publication
      WHERE publication."receiptId" = NEW."id"
    )
  THEN
    RAISE EXCEPTION 'Published receipt requires a remote publication'
      USING ERRCODE = '23514';
  END IF;

  IF NEW."resultClass" <> 'PUBLISHED' AND EXISTS (
    SELECT 1
    FROM "ClipPublishingReceiptPublication" publication
    WHERE publication."receiptId" = NEW."id"
  ) THEN
    RAISE EXCEPTION 'Only published receipts may own remote publications'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$clip_publishing_receipt_publications$;
