CREATE TYPE "State" AS ENUM ('QUEUE', 'PUBLISHED', 'ERROR', 'DRAFT');
CREATE TYPE "CreationMethod" AS ENUM (
  'UNKNOWN',
  'WEB',
  'MCP',
  'API',
  'AUTOPOST',
  'CLI'
);

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Integration" (
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

CREATE UNIQUE INDEX "Integration_organizationId_internalId_key"
  ON "Integration"("organizationId", "internalId");
CREATE INDEX "Integration_organizationId_idx" ON "Integration"("organizationId");
CREATE INDEX "Integration_providerIdentifier_idx" ON "Integration"("providerIdentifier");

CREATE TABLE "Media" (
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

CREATE INDEX "Media_name_idx" ON "Media"("name");
CREATE INDEX "Media_organizationId_idx" ON "Media"("organizationId");
CREATE INDEX "Media_type_idx" ON "Media"("type");

CREATE TABLE "Post" (
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

CREATE INDEX "Post_group_idx" ON "Post"("group");
CREATE INDEX "Post_publishDate_idx" ON "Post"("publishDate");
CREATE INDEX "Post_state_idx" ON "Post"("state");
CREATE INDEX "Post_organizationId_idx" ON "Post"("organizationId");
CREATE INDEX "Post_integrationId_idx" ON "Post"("integrationId");

CREATE TABLE "Tags" (
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

CREATE TABLE "TagsPosts" (
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

CREATE TABLE "LegacyUnrelated" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "payload" TEXT NOT NULL
);

INSERT INTO "Organization" ("id", "name", "updatedAt")
VALUES ('existing-org', 'Existing workspace', CURRENT_TIMESTAMP);

INSERT INTO "LegacyUnrelated" ("id", "payload")
VALUES ('legacy-row', 'must survive');
