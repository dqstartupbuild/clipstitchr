import { SocialNeedsAttentionError } from "../SocialNeedsAttentionError";
import { getTikTokBrandedContentPrivacyIsCompatible } from "@/lib/clipstitchr/social/getTikTokBrandedContentPrivacyIsCompatible";
import type { TikTokCreatorInfo } from "./TikTokCreatorInfo";
import type { TikTokTargetControls } from "./TikTokTargetControls";

export function assertTikTokCapabilitiesMatch({
  controls,
  creatorInfo,
  durationSeconds,
  isPhotoPost,
  publishMode,
}: {
  controls: TikTokTargetControls;
  creatorInfo: TikTokCreatorInfo;
  durationSeconds?: number;
  isPhotoPost: boolean;
  publishMode: "direct" | "draft";
}) {
  if (
    publishMode === "direct" &&
    (!controls.privacyLevel ||
      !creatorInfo.privacy_level_options.includes(controls.privacyLevel))
  ) {
    throw new SocialNeedsAttentionError(
      "TikTok changed who can watch this post. Review the privacy choice.",
    );
  }

  if (
    !getTikTokBrandedContentPrivacyIsCompatible(
      controls.brandContentToggle,
      controls.privacyLevel,
    )
  ) {
    throw new SocialNeedsAttentionError(
      "TikTok paid branded content cannot use Only you visibility. Review who can watch this post.",
    );
  }

  if (
    !isPhotoPost &&
    (durationSeconds === undefined ||
      durationSeconds > creatorInfo.max_video_post_duration_sec)
  ) {
    throw new SocialNeedsAttentionError(
      "This video is longer than TikTok currently allows for this account.",
    );
  }

  if (
    (controls.allowComment && creatorInfo.comment_disabled) ||
    (!isPhotoPost && controls.allowDuet && creatorInfo.duet_disabled) ||
    (!isPhotoPost && controls.allowStitch && creatorInfo.stitch_disabled)
  ) {
    throw new SocialNeedsAttentionError(
      "TikTok changed the interaction choices for this account. Review the post before it goes out.",
    );
  }

  if (
    isPhotoPost &&
    publishMode === "draft"
  ) {
    throw new SocialNeedsAttentionError(
      "TikTok photo posts can be sent directly after you review them.",
    );
  }
}
