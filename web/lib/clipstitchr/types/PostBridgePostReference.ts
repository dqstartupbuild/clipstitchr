import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { PostBridgePostStatus } from "@/lib/clipstitchr/types/PostBridgePostStatus";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

export type PostBridgePostReference = {
  createdAt: string;
  hasAudio: boolean;
  isDraft?: boolean;
  mediaIds: string[];
  mediaKind: PostBridgeMediaKind;
  platforms: PostBridgePlatform[];
  postId: string;
  scheduledAt?: string;
  socialAccountIds: number[];
  sourceType: PostBridgeSourceType;
  status: PostBridgePostStatus;
  updatedAt: string;
};
