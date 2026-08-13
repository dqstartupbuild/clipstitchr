import type { PublishingMediaProvider } from "@/lib/clipstitchr/publishing/media/PublishingMediaProvider";

export type PublishingMediaUrlSignRequest = {
  checksum?: string;
  contentType: string;
  objectKey: string;
  provider: PublishingMediaProvider;
  quotaIdentity: string;
  requestedValiditySeconds: number;
  sizeBytes: number;
  version?: string;
};
