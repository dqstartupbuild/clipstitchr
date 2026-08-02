CREATE TYPE "ClipPublishingTokenKind" AS ENUM (
  'ACCESS',
  'REFRESH',
  'LONG_LIVED_ACCESS'
);

CREATE TYPE "ClipPublishingProvider" AS ENUM (
  'INSTAGRAM',
  'INSTAGRAM_STANDALONE',
  'TIKTOK'
);

CREATE TYPE "ClipPublishingSourceKind" AS ENUM (
  'STITCH',
  'SWIPE',
  'LIBRARY'
);

CREATE TYPE "ClipPublishingIntent" AS ENUM (
  'DRAFT',
  'PUBLISH_NOW',
  'SCHEDULE'
);

CREATE TYPE "ClipPublishingPostDisposition" AS ENUM (
  'ACTIVE',
  'CANCELED',
  'UNCERTAIN',
  'ACTION_REQUIRED',
  'TERMINAL'
);

CREATE TYPE "ClipPublishingInternalState" AS ENUM (
  'DRAFT',
  'QUEUED',
  'DISPATCHING',
  'PROCESSING',
  'PUBLISHED',
  'FAILED',
  'CANCELED',
  'ACTION_REQUIRED',
  'UNCERTAIN'
);

CREATE TYPE "ClipPublishingAttemptStatus" AS ENUM (
  'INTENT',
  'STARTED',
  'SUCCEEDED',
  'FAILED',
  'UNCERTAIN',
  'CANCELED'
);

CREATE TYPE "ClipPublishingProviderOperation" AS ENUM (
  'META_MEDIA_CONTAINER',
  'META_CAROUSEL_CONTAINER',
  'META_MEDIA_PUBLISH',
  'TIKTOK_PUBLISH'
);

CREATE TYPE "ClipPublishingReceiptResult" AS ENUM (
  'PUBLISHED',
  'ACCEPTED_PROCESSING',
  'USER_ACTION_REQUIRED',
  'REJECTED',
  'CANCELED',
  'UNCERTAIN'
);

CREATE TYPE "ClipPublishingOutboxStatus" AS ENUM (
  'PENDING',
  'LEASED',
  'DELIVERED',
  'DEAD_LETTER'
);

CREATE TABLE "ClipPublishingTenant" (
  "id" TEXT NOT NULL,
  "tenantKey" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClipPublishingTenant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingTenant_org_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ClipPublishingTenant_tenantKey_key"
  ON "ClipPublishingTenant"("tenantKey");
CREATE UNIQUE INDEX "ClipPublishingTenant_org_key"
  ON "ClipPublishingTenant"("organizationId");
CREATE INDEX "ClipPublishingTenant_created_idx"
  ON "ClipPublishingTenant"("createdAt");

CREATE TABLE "ClipPublishingIntegrationSecret" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "providerIdentifier" "ClipPublishingProvider" NOT NULL,
  "tokenKind" "ClipPublishingTokenKind" NOT NULL,
  "envelope" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "replacedAt" TIMESTAMP(3),
  CONSTRAINT "ClipPublishingIntegrationSecret_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPubIntegrationSecret_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPubIntegrationSecret_integration_fkey"
    FOREIGN KEY ("integrationId") REFERENCES "Integration"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPubIntegrationSecret_version_check"
    CHECK ("version" > 0),
  CONSTRAINT "ClipPubIntegrationSecret_replacedAt_check"
    CHECK ("replacedAt" IS NULL OR "replacedAt" >= "createdAt")
);

CREATE UNIQUE INDEX "ClipPubIntegrationSecret_version_key"
  ON "ClipPublishingIntegrationSecret"(
    "tenantId", "integrationId", "tokenKind", "version"
  );
CREATE INDEX "ClipPubIntegrationSecret_active_idx"
  ON "ClipPublishingIntegrationSecret"(
    "tenantId", "integrationId", "tokenKind", "replacedAt"
  );
CREATE UNIQUE INDEX "ClipPubIntegrationSecret_one_active_key"
  ON "ClipPublishingIntegrationSecret"("tenantId", "integrationId", "tokenKind")
  WHERE "replacedAt" IS NULL;

CREATE FUNCTION "ClipPublishingValidateObjectManifest"(manifest JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $clip_publishing_validate_object_manifest$
DECLARE
  media_object JSONB;
BEGIN
  IF jsonb_typeof(manifest) <> 'array' THEN
    RETURN FALSE;
  END IF;

  IF jsonb_array_length(manifest) NOT BETWEEN 1 AND 20 THEN
    RETURN FALSE;
  END IF;

  FOR media_object IN
    SELECT value FROM jsonb_array_elements(manifest)
  LOOP
    IF jsonb_typeof(media_object) <> 'object' OR
       jsonb_typeof(media_object->'contentType') IS DISTINCT FROM 'string' OR
       length(media_object->>'contentType') NOT BETWEEN 3 AND 129 OR
       (media_object->>'contentType') !~
         '^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,63}/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,63}$' THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$clip_publishing_validate_object_manifest$;

CREATE TABLE "ClipPublishingMediaSource" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "sourceKind" "ClipPublishingSourceKind" NOT NULL,
  "sourceRecordId" TEXT NOT NULL,
  "sourceRevision" TEXT NOT NULL,
  "contentChecksum" TEXT NOT NULL,
  "objectManifest" JSONB NOT NULL,
  "mediaType" TEXT NOT NULL,
  "byteLength" BIGINT NOT NULL,
  "compatibilityFacts" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClipPublishingMediaSource_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingMediaSource_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingMediaSource_media_fkey"
    FOREIGN KEY ("mediaId") REFERENCES "Media"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingMediaSource_byteLength_check"
    CHECK ("byteLength" > 0),
  CONSTRAINT "ClipPublishingMediaSource_manifest_size_check"
    CHECK (pg_column_size("objectManifest") <= 131072),
  CONSTRAINT "ClipPublishingMediaSource_manifest_shape_check"
    CHECK ("ClipPublishingValidateObjectManifest"("objectManifest")),
  CONSTRAINT "ClipPublishingMediaSource_compatibility_size_check"
    CHECK (pg_column_size("compatibilityFacts") <= 32768)
);

CREATE UNIQUE INDEX "ClipPublishingMediaSource_media_key"
  ON "ClipPublishingMediaSource"("mediaId");
CREATE UNIQUE INDEX "ClipPublishingMediaSource_revision_key"
  ON "ClipPublishingMediaSource"(
    "tenantId", "sourceKind", "sourceRecordId", "sourceRevision"
  );
CREATE INDEX "ClipPublishingMediaSource_checksum_idx"
  ON "ClipPublishingMediaSource"("tenantId", "contentChecksum");

CREATE TABLE "ClipPublishingPostState" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "mediaSourceId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "canonicalRequestHash" TEXT NOT NULL,
  "sourceKind" "ClipPublishingSourceKind",
  "sourceRecordId" TEXT,
  "sourceRevision" TEXT,
  "intent" "ClipPublishingIntent" NOT NULL,
  "scheduledTimeZone" TEXT,
  "scheduledLocalTime" TEXT,
  "scheduledUtcOffsetMinutes" INTEGER,
  "workflowId" TEXT NOT NULL,
  "workflowRunId" TEXT,
  "disposition" "ClipPublishingPostDisposition" NOT NULL DEFAULT 'ACTIVE',
  "internalState" "ClipPublishingInternalState" NOT NULL DEFAULT 'QUEUED',
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClipPublishingPostState_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingPostState_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingPostState_post_fkey"
    FOREIGN KEY ("postId") REFERENCES "Post"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingPostState_integration_fkey"
    FOREIGN KEY ("integrationId") REFERENCES "Integration"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingPostState_media_fkey"
    FOREIGN KEY ("mediaSourceId") REFERENCES "ClipPublishingMediaSource"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingPostState_source_shape_check"
    CHECK (
      (
        "sourceKind" IS NULL AND
        "sourceRecordId" IS NULL AND
        "sourceRevision" IS NULL
      ) OR (
        "sourceKind" IS NOT NULL AND
        "sourceRecordId" IS NOT NULL AND
        "sourceRevision" IS NOT NULL
      )
    ),
  CONSTRAINT "ClipPublishingPostState_schedule_shape_check"
    CHECK (
      (
        "intent" = 'SCHEDULE' AND
        "scheduledTimeZone" IS NOT NULL AND
        "scheduledLocalTime" IS NOT NULL AND
        "scheduledUtcOffsetMinutes" IS NOT NULL AND
        "scheduledLocalTime" ~
          '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$' AND
        "scheduledUtcOffsetMinutes" BETWEEN -840 AND 840
      ) OR (
        "intent" IN ('DRAFT', 'PUBLISH_NOW') AND
        "scheduledTimeZone" IS NULL AND
        "scheduledLocalTime" IS NULL AND
        "scheduledUtcOffsetMinutes" IS NULL
      )
    ),
  CONSTRAINT "ClipPublishingPostState_canceled_shape_check"
    CHECK (
      (
        "canceledAt" IS NULL AND
        "disposition" <> 'CANCELED' AND
        "internalState" <> 'CANCELED'
      ) OR (
        "canceledAt" IS NOT NULL AND
        "disposition" = 'CANCELED' AND
        "internalState" = 'CANCELED'
      )
    )
);

CREATE UNIQUE INDEX "ClipPublishingPostState_post_key"
  ON "ClipPublishingPostState"("postId");
CREATE UNIQUE INDEX "ClipPublishingPostState_workflow_key"
  ON "ClipPublishingPostState"("workflowId");
CREATE UNIQUE INDEX "ClipPublishingPostState_idempotency_key"
  ON "ClipPublishingPostState"(
    "tenantId", "integrationId", "idempotencyKey"
  );
CREATE INDEX "ClipPublishingPostState_state_idx"
  ON "ClipPublishingPostState"("tenantId", "internalState", "createdAt");

CREATE TABLE "ClipPublishingAttempt" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "postStateId" TEXT NOT NULL,
  "attemptNumber" INTEGER NOT NULL,
  "actorClerkUserId" TEXT NOT NULL,
  "status" "ClipPublishingAttemptStatus" NOT NULL DEFAULT 'INTENT',
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "safeErrorCode" TEXT,
  "safeErrorMessage" TEXT,
  "checkpointVersion" INTEGER NOT NULL DEFAULT 0,
  "checkpoint" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "checkpointedAt" TIMESTAMP(3),
  "providerOperationKind" "ClipPublishingProviderOperation",
  "providerOperationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClipPublishingAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingAttempt_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAttempt_state_fkey"
    FOREIGN KEY ("postStateId") REFERENCES "ClipPublishingPostState"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAttempt_number_check"
    CHECK ("attemptNumber" > 0),
  CONSTRAINT "ClipPublishingAttempt_checkpointVersion_check"
    CHECK ("checkpointVersion" >= 0),
  CONSTRAINT "ClipPublishingAttempt_checkpoint_size_check"
    CHECK (pg_column_size("checkpoint") <= 16384),
  CONSTRAINT "ClipPublishingAttempt_checkpoint_time_check"
    CHECK (
      ("checkpointVersion" = 0 AND "checkpointedAt" IS NULL) OR
      ("checkpointVersion" > 0 AND "checkpointedAt" IS NOT NULL)
    ),
  CONSTRAINT "ClipPublishingAttempt_operation_pair_check"
    CHECK (
      ("providerOperationKind" IS NULL AND "providerOperationId" IS NULL) OR
      ("providerOperationKind" IS NOT NULL AND "providerOperationId" IS NOT NULL)
    )
);

CREATE UNIQUE INDEX "ClipPublishingAttempt_number_key"
  ON "ClipPublishingAttempt"("postStateId", "attemptNumber");
CREATE INDEX "ClipPublishingAttempt_tenant_idx"
  ON "ClipPublishingAttempt"("tenantId", "createdAt");

CREATE TABLE "ClipPublishingReceipt" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "postStateId" TEXT NOT NULL,
  "attemptId" TEXT,
  "providerIdentifier" "ClipPublishingProvider" NOT NULL,
  "resultClass" "ClipPublishingReceiptResult" NOT NULL,
  "responseDigest" TEXT NOT NULL,
  "safeMetadata" JSONB NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClipPublishingReceipt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingReceipt_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingReceipt_state_fkey"
    FOREIGN KEY ("postStateId") REFERENCES "ClipPublishingPostState"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingReceipt_attempt_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "ClipPublishingAttempt"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingReceipt_metadata_size_check"
    CHECK (pg_column_size("safeMetadata") <= 16384)
);

CREATE UNIQUE INDEX "ClipPublishingReceipt_digest_key"
  ON "ClipPublishingReceipt"("tenantId", "postStateId", "responseDigest");
CREATE INDEX "ClipPublishingReceipt_tenant_idx"
  ON "ClipPublishingReceipt"("tenantId", "observedAt");
CREATE UNIQUE INDEX "ClipPublishingReceipt_published_key"
  ON "ClipPublishingReceipt"("tenantId", "postStateId")
  WHERE "resultClass" = 'PUBLISHED';

CREATE TABLE "ClipPublishingReceiptPublication" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "receiptId" TEXT NOT NULL,
  "providerIdentifier" "ClipPublishingProvider" NOT NULL,
  "remotePublicationId" TEXT NOT NULL,
  "observableUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClipPublishingReceiptPublication_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingReceiptPublication_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingReceiptPublication_receipt_fkey"
    FOREIGN KEY ("receiptId") REFERENCES "ClipPublishingReceipt"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ClipPublishingReceiptPublication_receipt_key"
  ON "ClipPublishingReceiptPublication"("receiptId", "remotePublicationId");
CREATE UNIQUE INDEX "ClipPublishingReceiptPublication_remote_key"
  ON "ClipPublishingReceiptPublication"(
    "tenantId", "providerIdentifier", "remotePublicationId"
  );
CREATE INDEX "ClipPublishingReceiptPublication_tenant_idx"
  ON "ClipPublishingReceiptPublication"("tenantId", "createdAt");

CREATE FUNCTION "ClipPublishingRejectReceiptMutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_receipt_immutable$
BEGIN
  RAISE EXCEPTION 'ClipPublishingReceipt rows are immutable'
    USING ERRCODE = '55000';
END;
$clip_publishing_receipt_immutable$;

CREATE TRIGGER "ClipPublishingReceipt_immutable"
BEFORE UPDATE OR DELETE ON "ClipPublishingReceipt"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingRejectReceiptMutation"();

CREATE FUNCTION "ClipPublishingRejectReceiptPublicationMutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_publication_immutable$
BEGIN
  RAISE EXCEPTION 'ClipPublishingReceiptPublication rows are immutable'
    USING ERRCODE = '55000';
END;
$clip_publishing_publication_immutable$;

CREATE TRIGGER "ClipPublishingReceiptPublication_immutable"
BEFORE UPDATE OR DELETE ON "ClipPublishingReceiptPublication"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingRejectReceiptPublicationMutation"();

CREATE FUNCTION "ClipPublishingEnforceReceiptPublications"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_receipt_publications$
BEGIN
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

CREATE CONSTRAINT TRIGGER "ClipPublishingReceipt_publications_guard"
AFTER INSERT OR UPDATE ON "ClipPublishingReceipt"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingEnforceReceiptPublications"();

CREATE FUNCTION "ClipPublishingEnforcePublicationReceipt"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_publication_receipt$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingReceipt" receipt
    WHERE receipt."id" = NEW."receiptId"
      AND receipt."resultClass" = 'PUBLISHED'
  ) THEN
    RAISE EXCEPTION 'Remote publication requires a published receipt'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$clip_publishing_publication_receipt$;

CREATE CONSTRAINT TRIGGER "ClipPublishingReceiptPublication_receipt_guard"
AFTER INSERT OR UPDATE ON "ClipPublishingReceiptPublication"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingEnforcePublicationReceipt"();

CREATE TABLE "ClipPublishingOutbox" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "postStateId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "eventVersion" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "ClipPublishingOutboxStatus" NOT NULL DEFAULT 'PENDING',
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseOwner" TEXT,
  "leaseExpiresAt" TIMESTAMP(3),
  "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
  "lastSafeError" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClipPublishingOutbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingOutbox_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingOutbox_state_fkey"
    FOREIGN KEY ("postStateId") REFERENCES "ClipPublishingPostState"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingOutbox_eventVersion_check"
    CHECK ("eventVersion" > 0),
  CONSTRAINT "ClipPublishingOutbox_deliveryAttempts_check"
    CHECK ("deliveryAttempts" >= 0),
  CONSTRAINT "ClipPublishingOutbox_payload_size_check"
    CHECK (pg_column_size("payload") <= 16384),
  CONSTRAINT "ClipPublishingOutbox_safe_error_check"
    CHECK (
      "lastSafeError" IS NULL OR
      (
        length("lastSafeError") BETWEEN 1 AND 512 AND
        "lastSafeError" !~ '[[:cntrl:]]'
      )
    ),
  CONSTRAINT "ClipPublishingOutbox_state_shape_check"
    CHECK (
      (
        "status" = 'PENDING' AND
        "leaseOwner" IS NULL AND
        "leaseExpiresAt" IS NULL AND
        "deliveredAt" IS NULL
      ) OR (
        "status" = 'LEASED' AND
        "leaseOwner" IS NOT NULL AND
        "leaseExpiresAt" IS NOT NULL AND
        "deliveredAt" IS NULL
      ) OR (
        "status" = 'DELIVERED' AND
        "leaseOwner" IS NULL AND
        "leaseExpiresAt" IS NULL AND
        "deliveredAt" IS NOT NULL
      ) OR (
        "status" = 'DEAD_LETTER' AND
        "leaseOwner" IS NULL AND
        "leaseExpiresAt" IS NULL AND
        "deliveredAt" IS NULL
      )
    )
);

CREATE UNIQUE INDEX "ClipPublishingOutbox_event_key"
  ON "ClipPublishingOutbox"("postStateId", "eventType", "eventVersion");
CREATE INDEX "ClipPublishingOutbox_lease_idx"
  ON "ClipPublishingOutbox"("status", "availableAt", "leaseExpiresAt");
CREATE INDEX "ClipPublishingOutbox_tenant_idx"
  ON "ClipPublishingOutbox"("tenantId", "createdAt");

CREATE TABLE "ClipPublishingAnalyticsSnapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "integrationId" TEXT,
  "postStateId" TEXT,
  "receiptId" TEXT,
  "metricWindowStart" TIMESTAMP(3) NOT NULL,
  "metricWindowEnd" TIMESTAMP(3) NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "metrics" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClipPublishingAnalyticsSnapshot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingAnalytics_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAnalytics_integration_fkey"
    FOREIGN KEY ("integrationId") REFERENCES "Integration"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAnalytics_state_fkey"
    FOREIGN KEY ("postStateId") REFERENCES "ClipPublishingPostState"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAnalytics_receipt_fkey"
    FOREIGN KEY ("receiptId") REFERENCES "ClipPublishingReceipt"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAnalytics_window_check"
    CHECK ("metricWindowEnd" >= "metricWindowStart"),
  CONSTRAINT "ClipPublishingAnalytics_metrics_size_check"
    CHECK (pg_column_size("metrics") <= 32768),
  CONSTRAINT "ClipPublishingAnalytics_subject_check"
    CHECK (
      "integrationId" IS NOT NULL OR
      "postStateId" IS NOT NULL OR
      "receiptId" IS NOT NULL
    )
);

CREATE INDEX "ClipPublishingAnalytics_tenant_idx"
  ON "ClipPublishingAnalyticsSnapshot"("tenantId", "observedAt");
CREATE INDEX "ClipPublishingAnalytics_window_idx"
  ON "ClipPublishingAnalyticsSnapshot"(
    "integrationId", "metricWindowStart", "metricWindowEnd"
  );

CREATE TABLE "ClipPublishingAuditEvent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "actorClerkUserId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "safeMetadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClipPublishingAuditEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClipPublishingAuditEvent_tenant_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "ClipPublishingTenant"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ClipPublishingAuditEvent_metadata_size_check"
    CHECK (pg_column_size("safeMetadata") <= 16384)
);

CREATE INDEX "ClipPublishingAuditEvent_tenant_idx"
  ON "ClipPublishingAuditEvent"("tenantId", "createdAt");
CREATE INDEX "ClipPublishingAuditEvent_request_idx"
  ON "ClipPublishingAuditEvent"("tenantId", "requestId");

CREATE FUNCTION "ClipPublishingGuardTenantIdentity"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_tenant_identity$
BEGIN
  IF NEW."tenantKey" <> OLD."tenantKey" OR
     NEW."organizationId" <> OLD."organizationId" THEN
    RAISE EXCEPTION 'ClipPublishingTenant identity is immutable'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_tenant_identity$;

CREATE TRIGGER "ClipPublishingTenant_identity_guard"
BEFORE UPDATE ON "ClipPublishingTenant"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardTenantIdentity"();

CREATE FUNCTION "ClipPublishingGuardIntegrationSecretTenant"()
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
      END
  ) THEN
    RAISE EXCEPTION 'ClipPublishingIntegrationSecret tenant/provider mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_secret_tenant$;

CREATE TRIGGER "ClipPublishingIntegrationSecret_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingIntegrationSecret"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardIntegrationSecretTenant"();

CREATE FUNCTION "ClipPublishingGuardMediaSourceTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_media_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingTenant" tenant
    JOIN "Media" media
      ON media."organizationId" = tenant."organizationId"
    WHERE tenant."id" = NEW."tenantId"
      AND media."id" = NEW."mediaId"
  ) THEN
    RAISE EXCEPTION 'ClipPublishingMediaSource tenant mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_media_tenant$;

CREATE TRIGGER "ClipPublishingMediaSource_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingMediaSource"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardMediaSourceTenant"();

CREATE FUNCTION "ClipPublishingGuardPostStateTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_state_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingTenant" tenant
    JOIN "Post" post
      ON post."organizationId" = tenant."organizationId"
    JOIN "Integration" integration
      ON integration."id" = NEW."integrationId"
     AND integration."organizationId" = tenant."organizationId"
     AND post."integrationId" = integration."id"
    WHERE tenant."id" = NEW."tenantId"
      AND post."id" = NEW."postId"
      AND (
        (
          NEW."intent" = 'DRAFT' AND
          NEW."internalState" = 'DRAFT' AND
          post."state" = 'DRAFT'
        ) OR (
          NEW."intent" IN ('PUBLISH_NOW', 'SCHEDULE') AND
          NEW."internalState" <> 'DRAFT' AND
          post."state" <> 'DRAFT'
        )
      )
      AND (
        NEW."intent" <> 'SCHEDULE' OR
        post."publishDate" = (
          NEW."scheduledLocalTime"::timestamp -
          make_interval(mins => NEW."scheduledUtcOffsetMinutes")
        )
      )
  ) OR (
    NEW."mediaSourceId" IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM "ClipPublishingMediaSource" media_source
      WHERE media_source."id" = NEW."mediaSourceId"
        AND media_source."tenantId" = NEW."tenantId"
    )
  ) OR (
    NEW."intent" = 'SCHEDULE' AND NOT EXISTS (
      SELECT 1
      FROM pg_timezone_names
      WHERE pg_timezone_names.name = NEW."scheduledTimeZone"
    )
  ) THEN
    RAISE EXCEPTION 'ClipPublishingPostState tenant mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_state_tenant$;

CREATE TRIGGER "ClipPublishingPostState_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingPostState"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardPostStateTenant"();

CREATE FUNCTION "ClipPublishingGuardAttemptTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_attempt_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingPostState" post_state
    WHERE post_state."id" = NEW."postStateId"
      AND post_state."tenantId" = NEW."tenantId"
      AND post_state."intent" <> 'DRAFT'
  ) THEN
    RAISE EXCEPTION 'ClipPublishingAttempt tenant mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_attempt_tenant$;

CREATE TRIGGER "ClipPublishingAttempt_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingAttempt"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardAttemptTenant"();

CREATE FUNCTION "ClipPublishingGuardReceiptTenant"()
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

CREATE TRIGGER "ClipPublishingReceipt_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingReceipt"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardReceiptTenant"();

CREATE FUNCTION "ClipPublishingGuardReceiptPublicationTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_publication_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingReceipt" receipt
    WHERE receipt."id" = NEW."receiptId"
      AND receipt."tenantId" = NEW."tenantId"
      AND receipt."providerIdentifier" = NEW."providerIdentifier"
  ) THEN
    RAISE EXCEPTION 'ClipPublishingReceiptPublication tenant/provider mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_publication_tenant$;

CREATE TRIGGER "ClipPublishingReceiptPublication_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingReceiptPublication"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardReceiptPublicationTenant"();

CREATE FUNCTION "ClipPublishingGuardOutboxTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_outbox_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingPostState" post_state
    WHERE post_state."id" = NEW."postStateId"
      AND post_state."tenantId" = NEW."tenantId"
      AND post_state."workflowId" = NEW."workflowId"
      AND post_state."intent" <> 'DRAFT'
  ) THEN
    RAISE EXCEPTION 'ClipPublishingOutbox tenant/workflow mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_outbox_tenant$;

CREATE TRIGGER "ClipPublishingOutbox_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingOutbox"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardOutboxTenant"();

CREATE FUNCTION "ClipPublishingEnforceDestinationLifecycle"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_destination_lifecycle$
BEGIN
  IF NEW."intent" = 'DRAFT' THEN
    IF EXISTS (
      SELECT 1
      FROM "ClipPublishingAttempt" attempt
      WHERE attempt."postStateId" = NEW."id"
    ) OR EXISTS (
      SELECT 1
      FROM "ClipPublishingOutbox" outbox
      WHERE outbox."postStateId" = NEW."id"
    ) THEN
      RAISE EXCEPTION 'Draft destinations cannot own attempts or outbox work'
        USING ERRCODE = '23514';
    END IF;
  ELSIF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingAttempt" attempt
    WHERE attempt."postStateId" = NEW."id"
      AND attempt."attemptNumber" = 1
  ) OR NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingOutbox" outbox
    WHERE outbox."postStateId" = NEW."id"
      AND outbox."eventType" = 'publishing.destination.requested'
      AND outbox."eventVersion" = 1
  ) THEN
    RAISE EXCEPTION 'Queued destinations require an initial attempt and outbox event'
      USING ERRCODE = '23514';
  END IF;

  RETURN NULL;
END;
$clip_publishing_destination_lifecycle$;

CREATE CONSTRAINT TRIGGER "ClipPublishingPostState_lifecycle_guard"
AFTER INSERT OR UPDATE ON "ClipPublishingPostState"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingEnforceDestinationLifecycle"();

CREATE FUNCTION "ClipPublishingGuardAnalyticsTenant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $clip_publishing_analytics_tenant$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ClipPublishingTenant" tenant
    WHERE tenant."id" = NEW."tenantId"
      AND (
        NEW."integrationId" IS NULL OR EXISTS (
          SELECT 1
          FROM "Integration" integration
          WHERE integration."id" = NEW."integrationId"
            AND integration."organizationId" = tenant."organizationId"
        )
      )
      AND (
        NEW."postStateId" IS NULL OR EXISTS (
          SELECT 1
          FROM "ClipPublishingPostState" post_state
          WHERE post_state."id" = NEW."postStateId"
            AND post_state."tenantId" = tenant."id"
            AND (
              NEW."integrationId" IS NULL OR
              post_state."integrationId" = NEW."integrationId"
            )
        )
      )
      AND (
        NEW."receiptId" IS NULL OR EXISTS (
          SELECT 1
          FROM "ClipPublishingReceipt" receipt
          WHERE receipt."id" = NEW."receiptId"
            AND receipt."tenantId" = tenant."id"
            AND (
              NEW."postStateId" IS NULL OR
              receipt."postStateId" = NEW."postStateId"
            )
        )
      )
  ) THEN
    RAISE EXCEPTION 'ClipPublishingAnalyticsSnapshot tenant mismatch'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$clip_publishing_analytics_tenant$;

CREATE TRIGGER "ClipPublishingAnalyticsSnapshot_tenant_guard"
BEFORE INSERT OR UPDATE ON "ClipPublishingAnalyticsSnapshot"
FOR EACH ROW EXECUTE FUNCTION "ClipPublishingGuardAnalyticsTenant"();
