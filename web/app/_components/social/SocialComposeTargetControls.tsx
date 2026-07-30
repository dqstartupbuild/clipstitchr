import { SocialInstagramTargetControls } from "./SocialInstagramTargetControls";
import { SocialTikTokTargetControls } from "./SocialTikTokTargetControls";
import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";
import type { SocialComposeTargetDraft } from "@/lib/clipstitchr/social/types/SocialComposeTargetDraft";

type SocialComposeTargetControlsProps = {
  account: SocialComposeAccount;
  disabled: boolean;
  mediaKind: "video" | "image";
  target: SocialComposeTargetDraft;
  videoDurationSeconds?: number;
  onChange: (target: SocialComposeTargetDraft) => void;
};

export function SocialComposeTargetControls({
  account,
  disabled,
  mediaKind,
  target,
  videoDurationSeconds,
  onChange,
}: SocialComposeTargetControlsProps) {
  return account.platform === "tiktok" ? (
    <SocialTikTokTargetControls
      account={account}
      disabled={disabled}
      mediaKind={mediaKind}
      target={target}
      videoDurationSeconds={videoDurationSeconds}
      onChange={onChange}
    />
  ) : (
    <SocialInstagramTargetControls
      account={account}
      disabled={disabled}
      mediaKind={mediaKind}
      target={target}
      onChange={onChange}
    />
  );
}
