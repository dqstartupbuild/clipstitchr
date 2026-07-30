import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";

export const socialPublishingAcceptanceAccounts: SocialComposeAccount[] = [
  {
    id: "acceptance-tiktok",
    platform: "tiktok",
    username: "clipstitchr_creator",
    displayName: "ClipStitchr Creator",
    status: "connected",
    capabilitySnapshotJson: JSON.stringify({
      creator_nickname: "ClipStitchr Creator",
      creator_username: "clipstitchr_creator",
      privacy_level_options: ["PUBLIC_TO_EVERYONE", "SELF_ONLY"],
      comment_disabled: false,
      duet_disabled: false,
      stitch_disabled: false,
      max_video_post_duration_sec: 180,
    }),
  },
  {
    id: "acceptance-instagram",
    platform: "instagram",
    username: "clipstitchr_studio",
    displayName: "ClipStitchr Studio",
    status: "connected",
  },
];
