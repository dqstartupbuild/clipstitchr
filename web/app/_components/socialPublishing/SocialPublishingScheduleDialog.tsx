"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { SocialPublishingAccountCheckbox } from "@/app/_components/socialPublishing/SocialPublishingAccountCheckbox";
import { SocialPublishingPublishModePicker } from "@/app/_components/socialPublishing/SocialPublishingPublishModePicker";
import { SocialPublishingSoundModePicker } from "@/app/_components/socialPublishing/SocialPublishingSoundModePicker";
import { SocialPublishingTikTokOptions } from "@/app/_components/socialPublishing/SocialPublishingTikTokOptions";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { fetchSocialPublishingAccountOptions } from "@/lib/clipstitchr/client/fetchSocialPublishingAccountOptions";
import { scheduleSocialPublishingPost } from "@/lib/clipstitchr/client/scheduleSocialPublishingPost";
import type { SocialPublishingPostReference } from "@/lib/clipstitchr/types/SocialPublishingPostReference";
import type { SocialPublishingPublishMode } from "@/lib/clipstitchr/types/SocialPublishingPublishMode";
import type { SocialPublishingScheduleRenderOptions } from "@/lib/clipstitchr/types/SocialPublishingScheduleRenderOptions";
import type { SocialPublishingScheduleRenderResult } from "@/lib/clipstitchr/types/SocialPublishingScheduleRenderResult";
import type { SocialPublishingSoundMode } from "@/lib/clipstitchr/types/SocialPublishingSoundMode";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getSharedSocialPublishingTikTokPrivacyLevels } from "@/lib/clipstitchr/utils/getSharedSocialPublishingTikTokPrivacyLevels";

type SocialPublishingScheduleDialogProps = {
  allowMusic?: boolean;
  contextLabel?: string;
  defaultCaption?: string;
  sourceId: string;
  sourceProductId?: string;
  sourceTitle: string;
  sourceType: SocialPublishingSourceType;
  onClose: () => void;
  onRenderMedia: (
    options: SocialPublishingScheduleRenderOptions,
  ) => Promise<SocialPublishingScheduleRenderResult>;
  onScheduled?: (post: SocialPublishingPostReference) => void;
};

export function SocialPublishingScheduleDialog({
  allowMusic = false,
  contextLabel = "Post",
  defaultCaption = "",
  sourceId,
  sourceProductId,
  sourceTitle,
  sourceType,
  onClose,
  onRenderMedia,
  onScheduled,
}: SocialPublishingScheduleDialogProps) {
  const [accounts, setAccounts] = useState<SocialPublishingSocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [caption, setCaption] = useState(defaultCaption);
  const [publishMode, setPublishMode] =
    useState<SocialPublishingPublishMode>("schedule");
  const [musicTrack, setMusicTrack] = useState<SharedMusicTrack | null>(null);
  const [soundMode, setSoundMode] = useState<SocialPublishingSoundMode>("none");
  const [tiktokCommercialContentType, setTiktokCommercialContentType] =
    useState<SocialPublishingTikTokCommercialContentType>("brand_organic");
  const [tiktokConsentGiven, setTiktokConsentGiven] = useState(false);
  const [tiktokPrivacyLevel, setTiktokPrivacyLevel] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "loading" | "idle" | "rendering" | "sending" | "complete"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const isBusy =
    status === "loading" ||
    status === "rendering" ||
    status === "sending";
  const selectedAccountIdSet = useMemo(
    () => new Set(selectedAccountIds),
    [selectedAccountIds],
  );
  const selectedPlatforms = useMemo(
    () =>
      accounts
        .filter((account) => selectedAccountIdSet.has(account.id))
        .map((account) => account.platform),
    [accounts, selectedAccountIdSet],
  );
  const selectedAccounts = useMemo(
    () => accounts.filter((account) => selectedAccountIdSet.has(account.id)),
    [accounts, selectedAccountIdSet],
  );
  const tiktokPrivacyLevels = useMemo(
    () => getSharedSocialPublishingTikTokPrivacyLevels(selectedAccounts),
    [selectedAccounts],
  );
  const hasSelectedTikTokAccount = selectedPlatforms.includes("tiktok");
  const resolvedTiktokPrivacyLevel =
    tiktokPrivacyLevels.find(
      (privacyLevel) => privacyLevel.value === tiktokPrivacyLevel,
    )?.value ??
    tiktokPrivacyLevels.find(
      (privacyLevel) => privacyLevel.value === "PUBLIC_TO_EVERYONE",
    )?.value ??
    tiktokPrivacyLevels[0]?.value ??
    "";
  const statusMessage =
    status === "loading"
      ? "Loading connected accounts..."
      : status === "rendering"
        ? "Getting the post ready..."
        : status === "sending"
          ? "Sending it to Zernio..."
          : status === "complete"
            ? publishMode === "now"
              ? "Sent."
              : "Added to your queue."
            : "";

  useEffect(() => {
    let isCancelled = false;

    void fetchSocialPublishingAccountOptions(sourceProductId)
      .then((options) => {
        if (isCancelled) {
          return;
        }

        setAccounts(options.accounts);
        setSelectedAccountIds(options.defaultSocialAccountIds);
        setStatus("idle");
      })
      .catch((nextError) => {
        if (isCancelled) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load connected accounts.",
        );
        setStatus("idle");
      });

    return () => {
      isCancelled = true;
    };
  }, [sourceProductId]);

  const handleAccountChange = (accountId: string, checked: boolean) => {
    setTiktokConsentGiven(false);
    setSelectedAccountIds((currentIds) =>
      checked
        ? [...new Set([...currentIds, accountId])]
        : currentIds.filter((id) => id !== accountId),
    );
  };

  const handleSchedule = async () => {
    if (status === "complete") {
      return;
    }

    setError(null);

    try {
      if (!selectedAccountIds.length) {
        throw new Error("Choose at least one account.");
      }

      if (
        hasSelectedTikTokAccount &&
        (!resolvedTiktokPrivacyLevel || !tiktokConsentGiven)
      ) {
        throw new Error("Choose TikTok settings and confirm this post first.");
      }

      setStatus("rendering");
      setProgress(0);

      let selectedMusicTrack: SharedMusicTrack | null = null;

      if (allowMusic && soundMode === "manual") {
        selectedMusicTrack = musicTrack;
      }

      setStatus("rendering");

      const renderResult = await onRenderMedia({
        musicTrack: selectedMusicTrack,
        onProgress: (nextProgress) => setProgress(nextProgress * 0.8),
        platforms: selectedPlatforms,
      });

      if (!renderResult.mediaFiles.length) {
        throw new Error("Choose media before scheduling.");
      }

      setStatus("sending");
      setProgress(0.86);

      const result = await scheduleSocialPublishingPost({
        caption,
        hasAudio: Boolean(selectedMusicTrack) || renderResult.hasAudio,
        mediaFiles: renderResult.mediaFiles,
        socialAccountIds: selectedAccountIds,
        sourceId,
        sourceType,
        tiktokCommercialContentType,
        tiktokConsentGiven,
        tiktokPrivacyLevel: resolvedTiktokPrivacyLevel,
        title: sourceTitle,
        useQueue: publishMode === "schedule",
      });

      setStatus("complete");
      setProgress(1);
      onScheduled?.(result.postReference);
      setTimeout(onClose, 700);
    } catch (nextError) {
      setStatus("idle");
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to send this post.",
      );
    }
  };

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-publishing-schedule-dialog-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              {contextLabel}
            </p>
            <h2
              id="social-publishing-schedule-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {sourceTitle}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close schedule dialog"
            disabled={isBusy}
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>

        <div className="grid gap-5 p-4 sm:p-5">
          <div className="grid gap-3">
            <p className="text-sm font-bold text-text-primary">Accounts</p>
            {accounts.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {accounts.map((account) => (
                  <SocialPublishingAccountCheckbox
                    key={account.id}
                    account={account}
                    checked={selectedAccountIdSet.has(account.id)}
                    disabled={isBusy}
                    onChange={handleAccountChange}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
                Connect TikTok, Instagram, or YouTube Shorts in Zernio first.
              </p>
            )}
            {accounts.length > 0 && selectedAccountIds.length === 0 ? (
              <p className="text-sm font-semibold text-text-secondary">
                Pick accounts for this post or save product defaults in Settings.
              </p>
            ) : null}
          </div>

          <label className="block">
            <span className="text-sm font-bold text-text-primary">Caption</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
              value={caption}
              disabled={isBusy}
              onChange={(event) => {
                setCaption(event.target.value);
                setTiktokConsentGiven(false);
              }}
            />
          </label>

          {hasSelectedTikTokAccount ? (
            <SocialPublishingTikTokOptions
              commercialContentType={tiktokCommercialContentType}
              consentGiven={tiktokConsentGiven}
              consentLabel="I reviewed this post and approve publishing it to TikTok."
              disabled={isBusy}
              privacyLevel={resolvedTiktokPrivacyLevel}
              privacyLevels={tiktokPrivacyLevels}
              onCommercialContentTypeChange={(value) => {
                setTiktokCommercialContentType(value);
                setTiktokConsentGiven(false);
              }}
              onConsentGivenChange={setTiktokConsentGiven}
              onPrivacyLevelChange={(value) => {
                setTiktokPrivacyLevel(value);
                setTiktokConsentGiven(false);
              }}
            />
          ) : null}

          <SocialPublishingPublishModePicker
            disabled={isBusy}
            value={publishMode}
            onChange={setPublishMode}
          />

          {allowMusic ? (
            <div className="grid gap-3">
              <SocialPublishingSoundModePicker
                disabled={isBusy}
                value={soundMode}
                onChange={setSoundMode}
              />
              {soundMode === "manual" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <MusicSelectorButton
                    disabled={isBusy}
                    label={musicTrack ? "Change sound" : "Add sound"}
                    selectedTrackId={musicTrack?.id}
                    source="swipr"
                    onSelectTrack={(track) => setMusicTrack(track)}
                  />
                  {musicTrack ? (
                    <button
                      type="button"
                      className="text-sm font-semibold text-text-secondary underline-offset-4 hover:text-accent hover:underline"
                      disabled={isBusy}
                      onClick={() => setMusicTrack(null)}
                    >
                      Remove sound
                    </button>
                  ) : null}
                  {musicTrack ? (
                    <span className="text-sm font-semibold text-text-secondary">
                      {musicTrack.title}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-text-secondary">
                {statusMessage}
              </p>
              {status === "rendering" || status === "sending" ? (
                <ProgressBar value={progress} />
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={isBusy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              isLoading={isBusy}
              disabled={
                status === "complete" ||
                !accounts.length ||
                !selectedAccountIds.length ||
                (hasSelectedTikTokAccount &&
                  (!resolvedTiktokPrivacyLevel || !tiktokConsentGiven))
              }
              onClick={() => void handleSchedule()}
            >
              {publishMode === "now" ? "Post now" : "Add to queue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
