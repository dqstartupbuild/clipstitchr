"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { PostBridgeAccountCheckbox } from "@/app/_components/postBridge/PostBridgeAccountCheckbox";
import { PostBridgeAutomaticSoundStatus } from "@/app/_components/postBridge/PostBridgeAutomaticSoundStatus";
import { PostBridgePublishModePicker } from "@/app/_components/postBridge/PostBridgePublishModePicker";
import { PostBridgeSoundModePicker } from "@/app/_components/postBridge/PostBridgeSoundModePicker";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import { schedulePostBridgePost } from "@/lib/clipstitchr/client/schedulePostBridgePost";
import { useAutomaticPostBridgeSound } from "@/lib/clipstitchr/hooks/useAutomaticPostBridgeSound";
import type { PostBridgePostReference } from "@/lib/clipstitchr/types/PostBridgePostReference";
import type { PostBridgePublishMode } from "@/lib/clipstitchr/types/PostBridgePublishMode";
import type { PostBridgeScheduleRenderOptions } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderOptions";
import type { PostBridgeScheduleRenderResult } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderResult";
import type { PostBridgeSoundMode } from "@/lib/clipstitchr/types/PostBridgeSoundMode";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { createAutomaticSoundSearchQuery } from "@/lib/clipstitchr/utils/createAutomaticSoundSearchQuery";

type PostBridgeScheduleDialogProps = {
  allowMusic?: boolean;
  contextLabel?: string;
  defaultCaption?: string;
  soundSearchContext?: string;
  sourceId: string;
  sourceProductId?: string;
  sourceTitle: string;
  sourceType: PostBridgeSourceType;
  onClose: () => void;
  onRenderMedia: (
    options: PostBridgeScheduleRenderOptions,
  ) => Promise<PostBridgeScheduleRenderResult>;
  onScheduled?: (post: PostBridgePostReference) => void;
};

export function PostBridgeScheduleDialog({
  allowMusic = false,
  contextLabel = "Post",
  defaultCaption = "",
  soundSearchContext = "",
  sourceId,
  sourceProductId,
  sourceTitle,
  sourceType,
  onClose,
  onRenderMedia,
  onScheduled,
}: PostBridgeScheduleDialogProps) {
  const [accounts, setAccounts] = useState<PostBridgeSocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [caption, setCaption] = useState(defaultCaption);
  const [publishMode, setPublishMode] =
    useState<PostBridgePublishMode>("schedule");
  const [musicTrack, setMusicTrack] = useState<SharedMusicTrack | null>(null);
  const [soundMode, setSoundMode] = useState<PostBridgeSoundMode>(
    allowMusic ? "automatic" : "none",
  );
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "loading" | "idle" | "findingSound" | "rendering" | "sending" | "complete"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const automaticSoundSearchQuery = useMemo(
    () =>
      createAutomaticSoundSearchQuery({
        caption,
        context: soundSearchContext,
        sourceTitle,
      }),
    [caption, soundSearchContext, sourceTitle],
  );
  const automaticSound = useAutomaticPostBridgeSound({
    enabled: allowMusic && soundMode === "automatic",
    searchQuery: automaticSoundSearchQuery,
  });
  const isSoundBusy =
    automaticSound.isAcceptingRights || automaticSound.isResolving;
  const isBusy =
    status === "loading" ||
    status === "findingSound" ||
    status === "rendering" ||
    status === "sending" ||
    isSoundBusy;
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
  const statusMessage =
    status === "loading"
      ? "Loading connected accounts..."
      : status === "findingSound"
        ? "Finding a sound..."
      : status === "rendering"
        ? "Getting the post ready..."
        : status === "sending"
          ? "Sending it to Post Bridge..."
          : status === "complete"
            ? publishMode === "now"
              ? "Sent."
              : "Added to your queue."
            : "";

  useEffect(() => {
    let isCancelled = false;

    void fetchPostBridgeAccountOptions(sourceProductId)
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

  const handleAccountChange = (accountId: number, checked: boolean) => {
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

      setStatus("rendering");
      setProgress(0);

      let selectedMusicTrack: SharedMusicTrack | null = null;

      if (
        allowMusic &&
        soundMode === "automatic" &&
        automaticSound.canResolve
      ) {
        setStatus("findingSound");
        setProgress(0.05);

        try {
          selectedMusicTrack = await automaticSound.resolveSound();
        } catch {
          selectedMusicTrack = null;
        }
      } else if (allowMusic && soundMode === "manual") {
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

      const result = await schedulePostBridgePost({
        caption,
        hasAudio: Boolean(selectedMusicTrack) || renderResult.hasAudio,
        mediaFiles: renderResult.mediaFiles,
        socialAccountIds: selectedAccountIds,
        sourceId,
        sourceType,
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-3 py-4 sm:items-center sm:px-4 sm:py-6"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-bridge-schedule-dialog-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              {contextLabel}
            </p>
            <h2
              id="post-bridge-schedule-dialog-title"
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
                  <PostBridgeAccountCheckbox
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
                Connect TikTok, Instagram, or YouTube Shorts in Post Bridge first.
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
              onChange={(event) => setCaption(event.target.value)}
            />
          </label>

          <PostBridgePublishModePicker
            disabled={isBusy}
            value={publishMode}
            onChange={setPublishMode}
          />

          {allowMusic ? (
            <div className="grid gap-3">
              <PostBridgeSoundModePicker
                disabled={isBusy}
                value={soundMode}
                onChange={setSoundMode}
              />
              {soundMode === "automatic" ? (
                <PostBridgeAutomaticSoundStatus
                  hasAcceptedRights={automaticSound.hasAcceptedRights}
                  isAcceptingRights={automaticSound.isAcceptingRights}
                  isLoading={automaticSound.isLoading}
                  selectedSource={automaticSound.selectedSource}
                  selectedTrack={automaticSound.selectedTrack}
                  onAcceptRights={automaticSound.acceptRights}
                />
              ) : null}
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
                !selectedAccountIds.length
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
