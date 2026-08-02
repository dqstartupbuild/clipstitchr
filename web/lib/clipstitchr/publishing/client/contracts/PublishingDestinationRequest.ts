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
    };
