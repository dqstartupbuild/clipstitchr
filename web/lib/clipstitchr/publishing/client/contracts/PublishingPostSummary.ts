import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export type PublishingPostSummary = {
  accountName: string;
  caption: string;
  createdAt: string;
  id: string;
  integrationId: string;
  media: PublishingMediaDescriptor;
  provider: PublishingProvider;
  resultUrl: string | null;
  scheduledAt: string | null;
  status: PublishingPostStatus;
  statusMessage: string | null;
  timeZone: string;
  updatedAt: string;
};
