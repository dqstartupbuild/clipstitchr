import type { PublishingApiYouTubeSettings } from "./PublishingApiYouTubeSettings.js";

export type PublishingApiDestinationRequest =
  | Readonly<{
      integrationId: string;
      provider: "instagram";
      settings: Readonly<{ placement: "feed" | "story" }>;
    }>
  | Readonly<{
      integrationId: string;
      provider: "tiktok";
      settings:
        | Readonly<{ mode: "inbox" }>
        | Readonly<{
            allowComment: boolean;
            allowDuet: boolean;
            allowStitch: boolean;
            autoAddMusic: boolean;
            brandContent: boolean;
            brandOrganic: boolean;
            consentConfirmed: true;
            creatorInfoFetchedAt: number;
            isAigc: boolean;
            mode: "direct";
            privacyLevel: string;
          }>;
    }>
  | Readonly<{
      integrationId: string;
      provider: "youtube";
      settings: PublishingApiYouTubeSettings;
    }>;
