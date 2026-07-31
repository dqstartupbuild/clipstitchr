import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";
import type { SocialComposeTargetDraft } from "@/lib/clipstitchr/social/types/SocialComposeTargetDraft";

type SocialInstagramTargetControlsProps = {
  account: SocialComposeAccount;
  disabled: boolean;
  mediaKind: "video" | "image";
  target: SocialComposeTargetDraft;
  onChange: (target: SocialComposeTargetDraft) => void;
};

export function SocialInstagramTargetControls({
  account,
  disabled,
  mediaKind,
  target,
  onChange,
}: SocialInstagramTargetControlsProps) {
  return (
    <section className="rounded-lg bg-surface-muted p-3">
      <h3 className="text-sm font-bold text-text-primary">
        Instagram: {account.displayName || account.username}
      </h3>
      <p className="mt-1 text-xs leading-5 text-text-secondary">
        {mediaKind === "video"
          ? "This video will publish as a Reel."
          : "One photo publishes as an image. Two or more publish as a carousel."}
      </p>
      {mediaKind === "video" ? (
        <label className="mt-3 flex items-start gap-2 text-sm text-text-primary">
          <input
            className="mt-1"
            type="checkbox"
            checked={target.shareToFeed}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...target,
                shareToFeed: event.currentTarget.checked,
              })
            }
          />
          Also show this Reel in the account&apos;s main feed
        </label>
      ) : null}
    </section>
  );
}
