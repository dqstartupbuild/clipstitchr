export type PublishingWorkflowTikTokSettings =
  | Readonly<{
      provider: "tiktok";
      mode: "inbox";
    }>
  | Readonly<{
      provider: "tiktok";
      mode: "direct";
      allowComment: boolean;
      allowDuet: boolean;
      allowStitch: boolean;
      autoAddMusic: boolean;
      brandContent: boolean;
      brandOrganic: boolean;
      consentConfirmed: true;
      creatorInfoFetchedAt: number;
      isAigc: boolean;
      privacyLevel: string;
    }>;
