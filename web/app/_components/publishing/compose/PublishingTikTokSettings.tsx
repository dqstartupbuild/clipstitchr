"use client";

import { useEffect } from "react";
import type { TikTokComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/TikTokComposerSettings";
import { formatTikTokPrivacyLevel } from "@/lib/clipstitchr/publishing/client/formatTikTokPrivacyLevel";
import { getTikTokCreatorInfo } from "@/lib/clipstitchr/publishing/client/requests/getTikTokCreatorInfo";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";

type PublishingTikTokSettingsProps = {
  integrationId: string;
  onChange: (settings: TikTokComposerSettings) => void;
  settings: TikTokComposerSettings;
};

export function PublishingTikTokSettings({
  integrationId,
  onChange,
  settings,
}: PublishingTikTokSettingsProps) {
  const creatorInfo = usePublishingResource(
    (signal) => getTikTokCreatorInfo(integrationId, signal),
    settings.mode === "direct" ? `tiktok:${integrationId}` : null,
  );

  useEffect(() => {
    const info = creatorInfo.data;
    if (
      settings.mode !== "direct" ||
      !info ||
      (settings.creatorInfoFetchedAt === info.fetchedAtEpochMilliseconds &&
        (!info.commentsDisabled || !settings.allowComment) &&
        (!info.duetDisabled || !settings.allowDuet) &&
        (!info.stitchDisabled || !settings.allowStitch))
    ) {
      return;
    }
    onChange({
      ...settings,
      allowComment: info.commentsDisabled ? false : settings.allowComment,
      allowDuet: info.duetDisabled ? false : settings.allowDuet,
      allowStitch: info.stitchDisabled ? false : settings.allowStitch,
      consentConfirmed: false,
      creatorInfoFetchedAt: info.fetchedAtEpochMilliseconds,
      privacyLevel: info.privacyLevelOptions.includes(settings.privacyLevel)
        ? settings.privacyLevel
        : "",
    });
  }, [creatorInfo.data, onChange, settings]);

  const update = (next: Partial<TikTokComposerSettings>) =>
    onChange({ ...settings, ...next, consentConfirmed: false });
  const reloadCreatorInfo = () => {
    onChange({
      ...settings,
      consentConfirmed: false,
      creatorInfoFetchedAt: null,
    });
    creatorInfo.reload();
  };

  return (
    <div className="publishing-provider-settings publishing-tiktok-settings">
      <label>
        How TikTok should receive it
        <select
          value={settings.mode}
          onChange={(event) =>
            update({
              creatorInfoFetchedAt: null,
              mode: event.target.value as "direct" | "inbox",
              privacyLevel: "",
            })
          }
        >
          <option value="inbox">Send to my TikTok inbox</option>
          <option value="direct">Publish directly</option>
        </select>
      </label>
      {settings.mode === "inbox" ? (
        <p className="publishing-action-required-note">
          This does not publish the post. TikTok sends the media to your inbox, where you must finish and publish it within 24 hours. ClipStitchr will show the result as Needs action.
        </p>
      ) : creatorInfo.error ? (
        <div className="publishing-creator-info-error" role="alert">
          <p>{creatorInfo.error}</p>
          <button type="button" onClick={reloadCreatorInfo}>
            Refresh TikTok choices
          </button>
        </div>
      ) : creatorInfo.isLoading || !creatorInfo.data ? (
        <p className="publishing-creator-info-loading" role="status">
          Loading the choices this TikTok account allows right now.
        </p>
      ) : (
        <div className="publishing-tiktok-direct-fields">
          <div className="publishing-creator-info-summary">
            <span>
              {creatorInfo.data.nickname ||
                creatorInfo.data.username ||
                "TikTok account"}
            </span>
            <span>
              Videos up to {creatorInfo.data.maxVideoDurationSeconds} seconds
            </span>
            <button type="button" onClick={reloadCreatorInfo} disabled={creatorInfo.isLoading}>
              {creatorInfo.isLoading ? "Refreshing…" : "Refresh choices"}
            </button>
          </div>
          <label>
            Who can see this post?
            <select
              value={settings.privacyLevel}
              onChange={(event) => update({ privacyLevel: event.target.value })}
            >
              <option value="">Choose visibility</option>
              {creatorInfo.data.privacyLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {formatTikTokPrivacyLevel(option)}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="publishing-tiktok-interactions">
            <legend>Viewer interactions</legend>
            <label>
              <input
                checked={settings.allowComment}
                disabled={creatorInfo.data.commentsDisabled}
                onChange={(event) => update({ allowComment: event.target.checked })}
                type="checkbox"
              />
              Allow comments
            </label>
            <label>
              <input
                checked={settings.allowDuet}
                disabled={creatorInfo.data.duetDisabled}
                onChange={(event) => update({ allowDuet: event.target.checked })}
                type="checkbox"
              />
              Allow Duet for video
            </label>
            <label>
              <input
                checked={settings.allowStitch}
                disabled={creatorInfo.data.stitchDisabled}
                onChange={(event) => update({ allowStitch: event.target.checked })}
                type="checkbox"
              />
              Allow Stitch for video
            </label>
          </fieldset>
          <details className="publishing-tiktok-disclosures">
            <summary>Labels, music, and promotion</summary>
            <div>
              <label>
                <input
                  checked={settings.autoAddMusic}
                  onChange={(event) => update({ autoAddMusic: event.target.checked })}
                  type="checkbox"
                />
                Let TikTok add music when this is a photo post
              </label>
              <label>
                <input
                  checked={settings.isAigc}
                  onChange={(event) => update({ isAigc: event.target.checked })}
                  type="checkbox"
                />
                Label an AI-generated video
              </label>
              <label>
                <input
                  checked={settings.brandOrganic}
                  onChange={(event) => update({ brandOrganic: event.target.checked })}
                  type="checkbox"
                />
                This promotes my own brand
              </label>
              <label>
                <input
                  checked={settings.brandContent}
                  onChange={(event) => update({ brandContent: event.target.checked })}
                  type="checkbox"
                />
                This is branded content for another brand
              </label>
              {settings.brandOrganic || settings.brandContent ? (
                <p>
                  By posting, you confirm the applicable TikTok{" "}
                  <a
                    href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Music Usage Confirmation
                  </a>
                  {settings.brandContent ? (
                    <>
                      {" "}and{" "}
                      <a
                        href="https://www.tiktok.com/legal/page/global/bc-policy/en"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Branded Content Policy
                      </a>
                    </>
                  ) : null}
                  .
                </p>
              ) : null}
            </div>
          </details>
          <label className="publishing-tiktok-consent">
            <input
              checked={settings.consentConfirmed}
              onChange={(event) =>
                onChange({ ...settings, consentConfirmed: event.target.checked })
              }
              type="checkbox"
            />
            <span>
              I reviewed these current TikTok choices and want ClipStitchr to publish with them.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
