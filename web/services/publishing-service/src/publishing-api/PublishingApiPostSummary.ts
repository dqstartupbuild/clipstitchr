import type { PublishingApiPostStatus } from "./PublishingApiPostStatus.js";

export type PublishingApiPostSummary = Readonly<{
  accountName: string;
  caption: string;
  createdAt: string;
  id: string;
  integrationId: string;
  media: Readonly<{
    kind: "library-media" | "stitch" | "swipe";
    recordId: string;
  }>;
  provider: "instagram" | "tiktok";
  resultUrl: string | null;
  scheduledAt: string | null;
  status: PublishingApiPostStatus;
  statusMessage: string | null;
  timeZone: string;
  updatedAt: string;
}>;
