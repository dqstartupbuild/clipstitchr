export type TikTokComposerSettings = {
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  autoAddMusic: boolean;
  brandContent: boolean;
  brandOrganic: boolean;
  consentConfirmed: boolean;
  creatorInfoFetchedAt: number | null;
  isAigc: boolean;
  mode: "direct" | "inbox";
  privacyLevel: string;
  provider: "tiktok";
};
