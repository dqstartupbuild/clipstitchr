import type { PublishingMediaHeadClient } from "@/lib/clipstitchr/publishing/media/server/PublishingMediaHeadClient";

export type CreatePublishingMediaUrlSignerOptions = {
  bucketName: string;
  createGrantKeyBytes?: () => Buffer;
  createInitializationVector?: () => Buffer;
  headClient: PublishingMediaHeadClient;
  nowEpochMs?: () => number;
  publicOrigin: string;
  tokenSecret: string;
};
