import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";
import type { SocialComposeTargetDraft } from "@/lib/clipstitchr/social/types/SocialComposeTargetDraft";
import { readTikTokCapabilitySnapshot } from "@/lib/clipstitchr/social/readTikTokCapabilitySnapshot";

type SocialTikTokTargetControlsProps = {
  account: SocialComposeAccount;
  disabled: boolean;
  mediaKind: "video" | "image";
  target: SocialComposeTargetDraft;
  videoDurationSeconds?: number;
  onChange: (target: SocialComposeTargetDraft) => void;
};

export function SocialTikTokTargetControls({
  account,
  disabled,
  mediaKind,
  target,
  videoDurationSeconds,
  onChange,
}: SocialTikTokTargetControlsProps) {
  const capability = readTikTokCapabilitySnapshot(
    account.capabilitySnapshotJson,
  );
  const isPhotoPost = mediaKind === "image";
  const maximumVideoDuration = capability?.max_video_post_duration_sec ?? 0;
  const exceedsVideoDuration =
    target.publishMode === "direct" &&
    mediaKind === "video" &&
    typeof videoDurationSeconds === "number" &&
    maximumVideoDuration > 0 &&
    videoDurationSeconds > maximumVideoDuration;

  return (
    <section className="rounded-lg bg-surface-muted p-3">
      <h3 className="text-sm font-bold text-text-primary">
        TikTok:{" "}
        {capability?.creator_nickname ||
          account.displayName ||
          account.username}
      </h3>
      <p className="mt-1 text-xs leading-5 text-text-secondary">
        Post directly after review, or send a video to TikTok Inbox to finish
        there. Inbox delivery is not a public post.
      </p>
      <fieldset className="mt-3 grid gap-3" disabled={disabled}>
        <legend className="sr-only">
          TikTok choices for {account.username}
        </legend>
        {!isPhotoPost ? (
          <label className="grid gap-1 text-sm font-semibold text-text-primary">
            Delivery
            <select
              className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm"
              value={target.publishMode}
              onChange={(event) => {
                const publishMode = event.currentTarget.value as
                  | "direct"
                  | "draft";

                onChange({
                  ...target,
                  publishMode,
                  privacyLevel:
                    publishMode === "draft" ? "" : target.privacyLevel,
                  allowComment:
                    publishMode === "draft" ? false : target.allowComment,
                  allowDuet: publishMode === "draft" ? false : target.allowDuet,
                  allowStitch:
                    publishMode === "draft" ? false : target.allowStitch,
                  brandContentToggle:
                    publishMode === "draft" ? false : target.brandContentToggle,
                  brandOrganicToggle:
                    publishMode === "draft" ? false : target.brandOrganicToggle,
                  commercialContentEnabled:
                    publishMode === "draft"
                      ? false
                      : target.commercialContentEnabled,
                });
              }}
            >
              <option value="direct">Post automatically</option>
              <option value="draft">Send to TikTok for finishing</option>
            </select>
          </label>
        ) : (
          <p className="text-xs font-semibold text-text-secondary">
            TikTok photo posts are sent directly after your review.
          </p>
        )}
        {target.publishMode === "direct" ? (
          <>
            {capability ? (
              <label className="grid gap-1 text-sm font-semibold text-text-primary">
                Who can watch
                <select
                  className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm"
                  value={target.privacyLevel}
                  onChange={(event) =>
                    onChange({
                      ...target,
                      privacyLevel: event.currentTarget.value,
                    })
                  }
                >
                  <option value="">Choose before posting</option>
                  {capability.privacy_level_options
                    .filter(
                      (option) =>
                        !target.brandContentToggle || option !== "SELF_ONLY",
                    )
                    .map((option) => (
                      <option key={option} value={option}>
                        {option.replaceAll("_", " ").toLowerCase()}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <p className="text-xs font-semibold text-amber-700">
                Loading this account&apos;s current privacy choices...
              </p>
            )}
            {exceedsVideoDuration ? (
              <p className="text-xs font-semibold text-amber-700" role="alert">
                This video is {Math.ceil(videoDurationSeconds)} seconds. This
                TikTok account currently accepts videos up to{" "}
                {maximumVideoDuration} seconds.
              </p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  key: "allowComment" as const,
                  label: "Allow comments",
                  unavailable: capability?.comment_disabled === true,
                },
                {
                  key: "allowDuet" as const,
                  label: "Allow Duet",
                  unavailable:
                    isPhotoPost || capability?.duet_disabled === true,
                },
                {
                  key: "allowStitch" as const,
                  label: "Allow Stitch",
                  unavailable:
                    isPhotoPost || capability?.stitch_disabled === true,
                },
              ].map((choice) => (
                <label
                  key={choice.key}
                  className="flex items-center gap-2 text-sm text-text-primary"
                >
                  <input
                    type="checkbox"
                    checked={target[choice.key]}
                    disabled={disabled || choice.unavailable}
                    onChange={(event) =>
                      onChange({
                        ...target,
                        [choice.key]: event.currentTarget.checked,
                      })
                    }
                  />
                  {choice.label}
                </label>
              ))}
            </div>
            {isPhotoPost ? (
              <label className="flex items-start gap-2 text-sm text-text-primary">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={target.autoAddMusic}
                  onChange={(event) =>
                    onChange({
                      ...target,
                      autoAddMusic: event.currentTarget.checked,
                    })
                  }
                />
                Let TikTok pick a sound
              </label>
            ) : null}
            <div className="grid gap-2">
              <label className="flex items-start gap-2 text-sm text-text-primary">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={target.commercialContentEnabled}
                  onChange={(event) =>
                    onChange({
                      ...target,
                      commercialContentEnabled: event.currentTarget.checked,
                      brandContentToggle: event.currentTarget.checked
                        ? target.brandContentToggle
                        : false,
                      brandOrganicToggle: event.currentTarget.checked
                        ? target.brandOrganicToggle
                        : false,
                    })
                  }
                />
                This post promotes a brand, product, or service
              </label>
              {target.commercialContentEnabled ? (
                <div className="grid gap-2 pl-6">
                  <label className="flex items-start gap-2 text-sm text-text-primary">
                    <input
                      className="mt-1"
                      type="checkbox"
                      checked={target.brandOrganicToggle}
                      onChange={(event) =>
                        onChange({
                          ...target,
                          brandOrganicToggle: event.currentTarget.checked,
                        })
                      }
                    />
                    My own brand or business
                  </label>
                  <label className="flex items-start gap-2 text-sm text-text-primary">
                    <input
                      className="mt-1"
                      type="checkbox"
                      checked={target.brandContentToggle}
                      onChange={(event) =>
                        onChange({
                          ...target,
                          brandContentToggle: event.currentTarget.checked,
                          privacyLevel:
                            event.currentTarget.checked &&
                            target.privacyLevel === "SELF_ONLY"
                              ? ""
                              : target.privacyLevel,
                        })
                      }
                    />
                    Paid partnership with another brand
                  </label>
                  {!target.brandContentToggle && !target.brandOrganicToggle ? (
                    <p className="text-xs font-semibold text-amber-700">
                      Choose at least one promotion type.
                    </p>
                  ) : target.brandContentToggle ? (
                    <p className="text-xs leading-5 text-text-secondary">
                      TikTok will label this as Paid partnership.
                    </p>
                  ) : (
                    <p className="text-xs leading-5 text-text-secondary">
                      TikTok will label this as Promotional content.
                    </p>
                  )}
                  {target.brandContentToggle ? (
                    <p className="text-xs leading-5 text-text-secondary">
                      Paid branded content must be visible to more than Only
                      you.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <p className="text-xs leading-5 text-text-secondary">
            You&apos;ll choose visibility, interactions, music, and disclosures
            when you finish the post in TikTok.
          </p>
        )}
      </fieldset>
    </section>
  );
}
