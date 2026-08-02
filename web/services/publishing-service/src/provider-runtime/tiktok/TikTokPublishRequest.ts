import type { TikTokCreatorInfo } from "./TikTokCreatorInfo.js";

export type TikTokPublishRequest = Readonly<{
  accessToken: string;
  grantedScopes: readonly string[];
  mode: "direct" | "inbox";
  media:
    | Readonly<{
        kind: "video";
        urls: readonly [string];
        durationSeconds: number;
      }>
    | Readonly<{
        kind: "photo";
        urls: readonly string[];
      }>;
  caption: string;
  photoTitle: string | undefined;
  privacyLevel: string | undefined;
  allowComment: boolean | undefined;
  allowDuet: boolean | undefined;
  allowStitch: boolean | undefined;
  isAigc: boolean;
  brandContent: boolean;
  brandOrganic: boolean;
  autoAddMusic: boolean;
  creatorInfo: TikTokCreatorInfo | undefined;
  consentConfirmed: boolean;
}>;
