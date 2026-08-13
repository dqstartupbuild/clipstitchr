import type { PublishingThumbnailSelection } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailSelection";
import type { PublishingYouTubeVisibility } from "@/lib/clipstitchr/publishing/client/contracts/PublishingYouTubeVisibility";

export type PublishingDestinationRequest =
  | {
      integrationId: string;
      provider: "instagram";
      settings: {
        placement: "feed" | "story";
      };
    }
  | {
      integrationId: string;
      provider: "tiktok";
      settings:
        | {
            mode: "inbox";
          }
        | {
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
          };
    }
  | {
      integrationId: string;
      provider: "youtube";
      settings: {
        description?: string;
        madeForKids: boolean;
        tags?: string[];
        thumbnail?: PublishingThumbnailSelection;
        title: string;
        visibility: PublishingYouTubeVisibility;
      };
    };
