import type { PublishingMediaHeadObject } from "./PublishingMediaHeadObject.js";

export type PublishingWorkflowMediaGrantResolverOptions = Readonly<{
  createGrantKeyBytes?: () => Buffer;
  createInitializationVector?: () => Buffer;
  headObject: (objectKey: string) => Promise<PublishingMediaHeadObject>;
  nowEpochMilliseconds?: () => number;
  publicOrigin: string;
  quotaSecret: string;
  tokenSecret: string;
}>;
