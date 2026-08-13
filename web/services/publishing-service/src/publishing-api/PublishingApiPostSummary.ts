import type { PublishingApiPostStatus } from "./PublishingApiPostStatus.js";
import type { PublishingApiMediaKind } from "./PublishingApiMediaKind.js";

export type PublishingApiPostSummary = Readonly<{
  accountName: string;
  caption: string;
  createdAt: string;
  id: string;
  integrationId: string;
  media: Readonly<{
    kind: PublishingApiMediaKind;
    recordId: string;
  }>;
  productId: string;
  provider: "instagram" | "tiktok" | "youtube";
  resultUrl: string | null;
  scheduledAt: string | null;
  status: PublishingApiPostStatus;
  statusMessage: string | null;
  timeZone: string;
  updatedAt: string;
}>;
