"use client";

import { useEffect } from "react";
import type { TikTokComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/TikTokComposerSettings";
import { formatTikTokPrivacyLevel } from "@/lib/clipstitchr/publishing/client/formatTikTokPrivacyLevel";
import { getTikTokCreatorInfo } from "@/lib/clipstitchr/publishing/client/requests/getTikTokCreatorInfo";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";
import { getPublishingTikTokUnavailableInteractions } from "./getPublishingTikTokUnavailableInteractions";
import { reloadPublishingTikTokCreatorInfo } from "./reloadPublishingTikTokCreatorInfo";
import { updatePublishingTikTokSettings } from "./updatePublishingTikTokSettings";

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

  const unavailableInteractions = creatorInfo.data
    ? getPublishingTikTokUnavailableInteractions(creatorInfo.data)
    : [];
  const unavailableInteractionsId = `publishing-tiktok-interactions-${integrationId}`;

  return (
    <div className="publishing-provider-settings publishing-tiktok-settings">
      <label>
        How TikTok should receive it
        <select
          value={settings.mode}
          onChange={(event) =>
            updatePublishingTikTokSettings(settings, {
              creatorInfoFetchedAt: null,
              mode: event.target.value as "direct" | "inbox",
              privacyLevel: "",
            }, onChange)
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
          <button type="button" onClick={() => reloadPublishingTikTokCreatorInfo(settings, onChange, creatorInfo.reload)}>
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
            <button type="button" onClick={() => reloadPublishingTikTokCreatorInfo(settings, onChange, creatorInfo.reload)} disabled={creatorInfo.isLoading}>
              {creatorInfo.isLoading ? "Refreshing…" : "Refresh choices"}
            </button>
          </div>
          <label>
            Who can see this post?
            <select
              value={settings.privacyLevel}
              onChange={(event) => updatePublishingTikTokSettings(settings, { privacyLevel: event.target.value }, onChange)}
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
            {unavailableInteractions.length > 0 ? (
              <p
                className="publishing-provider-unavailable"
                id={unavailableInteractionsId}
              >
                This TikTok account does not allow {unavailableInteractions.join(", ")} for this post.
              </p>
            ) : null}
            <label>
              <input
                aria-describedby={creatorInfo.data.commentsDisabled ? unavailableInteractionsId : undefined}
                checked={settings.allowComment}
                disabled={creatorInfo.data.commentsDisabled}
                onChange={(event) => updatePublishingTikTokSettings(settings, { allowComment: event.target.checked }, onChange)}
                type="checkbox"
              />
              Allow comments
            </label>
            <label>
              <input
                aria-describedby={creatorInfo.data.duetDisabled ? unavailableInteractionsId : undefined}
                checked={settings.allowDuet}
                disabled={creatorInfo.data.duetDisabled}
                onChange={(event) => updatePublishingTikTokSettings(settings, { allowDuet: event.target.checked }, onChange)}
                type="checkbox"
              />
              Allow Duet for video
            </label>
            <label>
              <input
                aria-describedby={creatorInfo.data.stitchDisabled ? unavailableInteractionsId : undefined}
                checked={settings.allowStitch}
                disabled={creatorInfo.data.stitchDisabled}
                onChange={(event) => updatePublishingTikTokSettings(settings, { allowStitch: event.target.checked }, onChange)}
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
                  onChange={(event) => updatePublishingTikTokSettings(settings, { autoAddMusic: event.target.checked }, onChange)}
                  type="checkbox"
                />
                Let TikTok add music when this is a photo post
              </label>
              <label>
                <input
                  checked={settings.isAigc}
                  onChange={(event) => updatePublishingTikTokSettings(settings, { isAigc: event.target.checked }, onChange)}
                  type="checkbox"
                />
                Label an AI-generated video
              </label>
              <label>
                <input
                  checked={settings.brandOrganic}
                  onChange={(event) => updatePublishingTikTokSettings(settings, { brandOrganic: event.target.checked }, onChange)}
                  type="checkbox"
                />
                This promotes my own brand
              </label>
              <label>
                <input
                  checked={settings.brandContent}
                  onChange={(event) => updatePublishingTikTokSettings(settings, { brandContent: event.target.checked }, onChange)}
                  type="checkbox"
                />
                This is branded content for another brand
              </label>
              {settings.brandOrganic || settings.brandContent ? (
                <p>
                  By posting, you confirm the applicable TikTok{" "}
                  <a
                    href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Music Usage Confirmation
                  </a>
                  {settings.brandContent ? (
                    <>
                      {" "}and{" "}
                      <a
                        href="https://www.tiktok.com/legal/page/global/bc-policy/en"
                        rel="noreferrer noopener"
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
