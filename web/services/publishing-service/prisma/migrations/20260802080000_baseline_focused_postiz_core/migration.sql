-- Focused Postiz core baseline for ClipStitchr publishing.
--
-- Derived from the Gitroom/Postiz Prisma schema at upstream commit
-- cf4c432c00c9db775ea1b1f12480a8e2b89aec32 and modified for the bounded
-- ClipStitchr publishing source boundary. See MODIFICATIONS.md and
-- THIRD_PARTY_NOTICES.md at the repository root.
--
-- This migration is deliberately additive. On a fresh database it creates the
-- six focused Postiz tables used by the publishing service. On an existing
-- Postiz database it preserves the existing tables and any extra columns, then
-- fails closed if a required core column is absent.

DO $clip_publishing_state_enum$
BEGIN
  CREATE TYPE "State" AS ENUM ('QUEUE', 'PUBLISHED', 'ERROR', 'DRAFT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$clip_publishing_state_enum$;

DO $clip_publishing_creation_method_enum$
BEGIN
  CREATE TYPE "CreationMethod" AS ENUM (
    'UNKNOWN',
    'WEB',
    'MCP',
    'API',
    'AUTOPOST',
    'CLI'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$clip_publishing_creation_method_enum$;

CREATE TABLE IF NOT EXISTS "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Integration" (
  "id" TEXT NOT NULL,
  "internalId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "picture" TEXT,
  "providerIdentifier" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "disabled" BOOLEAN NOT NULL DEFAULT false,
  "tokenExpiration" TIMESTAMP(3),
  "refreshToken" TEXT,
  "profile" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3),
  "inBetweenSteps" BOOLEAN NOT NULL DEFAULT false,
  "refreshNeeded" BOOLEAN NOT NULL DEFAULT false,
  "postingTimes" TEXT NOT NULL DEFAULT '[{"time":120}, {"time":400}, {"time":700}]',
  "customInstanceDetails" TEXT,
  "rootInternalId" TEXT,
  "additionalSettings" TEXT DEFAULT '[]',
  CONSTRAINT "Integration_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Integration_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Media" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "originalName" TEXT,
  "path" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "fileSize" INTEGER NOT NULL DEFAULT 0,
  "type" TEXT NOT NULL DEFAULT 'image',
  "thumbnail" TEXT,
  "alt" TEXT,
  "thumbnailTimestamp" INTEGER,
  CONSTRAINT "Media_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Media_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT NOT NULL,
  "state" "State" NOT NULL DEFAULT 'QUEUE',
  "publishDate" TIMESTAMP(3) NOT NULL,
  "organizationId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "delay" INTEGER NOT NULL DEFAULT 0,
  "group" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "parentPostId" TEXT,
  "releaseId" TEXT,
  "releaseURL" TEXT,
  "settings" TEXT,
  "image" TEXT,
  "creationMethod" "CreationMethod" NOT NULL DEFAULT 'UNKNOWN',
  "intervalInDays" INTEGER,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Post_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Post_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Post_integrationId_fkey"
    FOREIGN KEY ("integrationId") REFERENCES "Integration"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Post_parentPostId_fkey"
    FOREIGN KEY ("parentPostId") REFERENCES "Post"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Tags" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tags_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Tags_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TagsPosts" (
  "postId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TagsPosts_pkey" PRIMARY KEY ("postId", "tagId"),
  CONSTRAINT "TagsPosts_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "Post"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "TagsPosts_tagId_fkey"
    FOREIGN KEY ("tagId") REFERENCES "Tags"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

DO $clip_publishing_validate_focused_core$
DECLARE
  required_column RECORD;
BEGIN
  FOR required_column IN
    SELECT *
    FROM (VALUES
      ('Organization', 'id'),
      ('Organization', 'name'),
      ('Organization', 'createdAt'),
      ('Organization', 'updatedAt'),
      ('Integration', 'id'),
      ('Integration', 'internalId'),
      ('Integration', 'organizationId'),
      ('Integration', 'name'),
      ('Integration', 'picture'),
      ('Integration', 'providerIdentifier'),
      ('Integration', 'type'),
      ('Integration', 'token'),
      ('Integration', 'disabled'),
      ('Integration', 'tokenExpiration'),
      ('Integration', 'refreshToken'),
      ('Integration', 'profile'),
      ('Integration', 'deletedAt'),
      ('Integration', 'createdAt'),
      ('Integration', 'updatedAt'),
      ('Integration', 'inBetweenSteps'),
      ('Integration', 'refreshNeeded'),
      ('Integration', 'postingTimes'),
      ('Integration', 'customInstanceDetails'),
      ('Integration', 'rootInternalId'),
      ('Integration', 'additionalSettings'),
      ('Media', 'id'),
      ('Media', 'name'),
      ('Media', 'originalName'),
      ('Media', 'path'),
      ('Media', 'organizationId'),
      ('Media', 'createdAt'),
      ('Media', 'updatedAt'),
      ('Media', 'deletedAt'),
      ('Media', 'fileSize'),
      ('Media', 'type'),
      ('Media', 'thumbnail'),
      ('Media', 'alt'),
      ('Media', 'thumbnailTimestamp'),
      ('Post', 'id'),
      ('Post', 'state'),
      ('Post', 'publishDate'),
      ('Post', 'organizationId'),
      ('Post', 'integrationId'),
      ('Post', 'content'),
      ('Post', 'delay'),
      ('Post', 'group'),
      ('Post', 'title'),
      ('Post', 'description'),
      ('Post', 'parentPostId'),
      ('Post', 'releaseId'),
      ('Post', 'releaseURL'),
      ('Post', 'settings'),
      ('Post', 'image'),
      ('Post', 'creationMethod'),
      ('Post', 'intervalInDays'),
      ('Post', 'error'),
      ('Post', 'createdAt'),
      ('Post', 'updatedAt'),
      ('Post', 'deletedAt'),
      ('Tags', 'id'),
      ('Tags', 'name'),
      ('Tags', 'color'),
      ('Tags', 'orgId'),
      ('Tags', 'deletedAt'),
      ('Tags', 'createdAt'),
      ('Tags', 'updatedAt'),
      ('TagsPosts', 'postId'),
      ('TagsPosts', 'tagId'),
      ('TagsPosts', 'createdAt'),
      ('TagsPosts', 'updatedAt')
    ) AS required_columns(table_name, column_name)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns existing_column
      WHERE existing_column.table_schema = current_schema()
        AND existing_column.table_name = required_column.table_name
        AND existing_column.column_name = required_column.column_name
    ) THEN
      RAISE EXCEPTION 'Focused Postiz core is missing %.%',
        required_column.table_name,
        required_column.column_name
        USING ERRCODE = '42703';
    END IF;
  END LOOP;
END;
$clip_publishing_validate_focused_core$;

CREATE UNIQUE INDEX IF NOT EXISTS "Integration_organizationId_internalId_key"
  ON "Integration"("organizationId", "internalId");
CREATE INDEX IF NOT EXISTS "Integration_rootInternalId_idx"
  ON "Integration"("rootInternalId");
CREATE INDEX IF NOT EXISTS "Integration_organizationId_idx"
  ON "Integration"("organizationId");
CREATE INDEX IF NOT EXISTS "Integration_providerIdentifier_idx"
  ON "Integration"("providerIdentifier");
CREATE INDEX IF NOT EXISTS "Integration_updatedAt_idx"
  ON "Integration"("updatedAt");
CREATE INDEX IF NOT EXISTS "Integration_createdAt_idx"
  ON "Integration"("createdAt");
CREATE INDEX IF NOT EXISTS "Integration_deletedAt_idx"
  ON "Integration"("deletedAt");
CREATE INDEX IF NOT EXISTS "Integration_inBetweenSteps_idx"
  ON "Integration"("inBetweenSteps");
CREATE INDEX IF NOT EXISTS "Integration_refreshNeeded_idx"
  ON "Integration"("refreshNeeded");
CREATE INDEX IF NOT EXISTS "Integration_disabled_idx"
  ON "Integration"("disabled");

CREATE INDEX IF NOT EXISTS "Media_name_idx" ON "Media"("name");
CREATE INDEX IF NOT EXISTS "Media_organizationId_idx"
  ON "Media"("organizationId");
CREATE INDEX IF NOT EXISTS "Media_type_idx" ON "Media"("type");

CREATE INDEX IF NOT EXISTS "Post_group_idx" ON "Post"("group");
CREATE INDEX IF NOT EXISTS "Post_deletedAt_idx" ON "Post"("deletedAt");
CREATE INDEX IF NOT EXISTS "Post_publishDate_idx" ON "Post"("publishDate");
CREATE INDEX IF NOT EXISTS "Post_state_idx" ON "Post"("state");
CREATE INDEX IF NOT EXISTS "Post_organizationId_idx"
  ON "Post"("organizationId");
CREATE INDEX IF NOT EXISTS "Post_parentPostId_idx" ON "Post"("parentPostId");
CREATE INDEX IF NOT EXISTS "Post_intervalInDays_idx"
  ON "Post"("intervalInDays");
CREATE INDEX IF NOT EXISTS "Post_creationMethod_idx"
  ON "Post"("creationMethod");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX IF NOT EXISTS "Post_updatedAt_idx" ON "Post"("updatedAt");
CREATE INDEX IF NOT EXISTS "Post_releaseURL_idx" ON "Post"("releaseURL");
CREATE INDEX IF NOT EXISTS "Post_integrationId_idx"
  ON "Post"("integrationId");

CREATE INDEX IF NOT EXISTS "Tags_orgId_idx" ON "Tags"("orgId");
CREATE INDEX IF NOT EXISTS "Tags_deletedAt_idx" ON "Tags"("deletedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "TagsPosts_postId_tagId_key"
  ON "TagsPosts"("postId", "tagId");
