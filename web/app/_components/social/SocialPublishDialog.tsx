"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SocialComposeAccountPicker } from "./SocialComposeAccountPicker";
import { SocialComposeSchedulePicker } from "./SocialComposeSchedulePicker";
import { SocialComposeTargetControls } from "./SocialComposeTargetControls";
import { SocialConsentCheckbox } from "./SocialConsentCheckbox";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { refreshSocialAccountCapabilities } from "@/lib/clipstitchr/client/refreshSocialAccountCapabilities";
import { uploadSocialPostAssets } from "@/lib/clipstitchr/client/uploadSocialPostAssets";
import { useDialogFocusManagement } from "@/lib/clipstitchr/hooks/useDialogFocusManagement";
import { createSocialComposeTargetDraft } from "@/lib/clipstitchr/social/createSocialComposeTargetDraft";
import { createSocialTargetControlsJson } from "@/lib/clipstitchr/social/createSocialTargetControlsJson";
import { getFutureIsoDateTime } from "@/lib/clipstitchr/social/getFutureIsoDateTime";
import { readTikTokCapabilitySnapshot } from "@/lib/clipstitchr/social/readTikTokCapabilitySnapshot";
import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";
import type { SocialComposeScheduleDraft } from "@/lib/clipstitchr/social/types/SocialComposeScheduleDraft";
import type { SocialComposeTargetDraft } from "@/lib/clipstitchr/social/types/SocialComposeTargetDraft";
import type { SocialPlatform } from "@/lib/clipstitchr/social/types/SocialPlatform";
import type { SocialPublishRenderOptions } from "@/lib/clipstitchr/social/types/SocialPublishRenderOptions";
import type { SocialPublishRenderResult } from "@/lib/clipstitchr/social/types/SocialPublishRenderResult";

type SocialPublishDialogProps = {
  defaultCaption?: string;
  mediaKind: "video" | "image";
  previewUrl?: string | null;
  productId: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: "stitch" | "swipe";
  videoDurationSeconds?: number;
  videoHeight?: number;
  videoWidth?: number;
  onClose: () => void;
  onRenderMedia: (
    options: SocialPublishRenderOptions,
  ) => Promise<SocialPublishRenderResult>;
  onScheduled?: (postId: string) => void;
};

export function SocialPublishDialog({
  defaultCaption = "",
  mediaKind,
  previewUrl,
  productId,
  sourceId,
  sourceTitle,
  sourceType,
  videoDurationSeconds,
  videoHeight,
  videoWidth,
  onClose,
  onRenderMedia,
  onScheduled,
}: SocialPublishDialogProps) {
  const { isAuthenticated } = useConvexAuth();
  const accounts = useQuery(
    api.socialAccounts.listSocialAccounts.listSocialAccounts,
    isAuthenticated ? {} : "skip",
  ) as SocialComposeAccount[] | undefined;
  const productSelections = useQuery(
    api.productSocialAccounts.listProductSocialAccounts
      .listProductSocialAccounts,
    isAuthenticated ? { productId } : "skip",
  );
  const createPost = useMutation(
    api.socialPosts.createSocialPost.createSocialPost,
  );
  const [title, setTitle] = useState(sourceTitle);
  const [caption, setCaption] = useState(defaultCaption);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [targets, setTargets] = useState<
    Record<string, SocialComposeTargetDraft>
  >({});
  const [schedule, setSchedule] = useState<SocialComposeScheduleDraft>({
    mode: "product_queue",
    scheduledFor: "",
  });
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "idle" | "rendering" | "uploading" | "saving" | "complete"
  >("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const defaultsInitializedRef = useRef(false);
  const refreshedAccountIdsRef = useRef(new Set<string>());
  const isBusy =
    status === "loading" ||
    status === "rendering" ||
    status === "uploading" ||
    status === "saving";
  const dialogRef = useDialogFocusManagement(() => {
    if (!isBusy) {
      onClose();
    }
  });
  const selectedAccounts = useMemo(
    () =>
      (accounts ?? []).filter((account) =>
        selectedAccountIds.includes(account.id),
      ),
    [accounts, selectedAccountIds],
  );
  const selectedPlatforms = useMemo(
    () =>
      [
        ...new Set(selectedAccounts.map((account) => account.platform)),
      ] as SocialPlatform[],
    [selectedAccounts],
  );
  const selectedTikTokAccounts = useMemo(
    () => selectedAccounts.filter((account) => account.platform === "tiktok"),
    [selectedAccounts],
  );
  const hasMissingTikTokChoices = selectedTikTokAccounts.some((account) => {
    const target = targets[account.id];
    const capability = readTikTokCapabilitySnapshot(
      account.capabilitySnapshotJson,
    );

    if (!target) {
      return true;
    }

    if (target.publishMode === "draft") {
      return false;
    }

    return (
      !capability ||
      !target.privacyLevel ||
      !capability.privacy_level_options.includes(target.privacyLevel)
    );
  });
  const hasTikTokDurationConflict = selectedTikTokAccounts.some((account) => {
    const target = targets[account.id];
    const capability = readTikTokCapabilitySnapshot(
      account.capabilitySnapshotJson,
    );

    return (
      mediaKind === "video" &&
      target?.publishMode === "direct" &&
      typeof videoDurationSeconds === "number" &&
      typeof capability?.max_video_post_duration_sec === "number" &&
      capability.max_video_post_duration_sec > 0 &&
      videoDurationSeconds > capability.max_video_post_duration_sec
    );
  });
  const hasIncompleteTikTokDisclosure = selectedTikTokAccounts.some(
    (account) => {
      const target = targets[account.id];

      return (
        target?.publishMode === "direct" &&
        target.commercialContentEnabled &&
        !target.brandContentToggle &&
        !target.brandOrganicToggle
      );
    },
  );
  const hasDirectTikTokTarget = selectedTikTokAccounts.some(
    (account) => targets[account.id]?.publishMode === "direct",
  );
  const hasTikTokBrandedContent = selectedTikTokAccounts.some((account) => {
    const target = targets[account.id];

    return target?.publishMode === "direct" && target.brandContentToggle;
  });

  useEffect(() => {
    if (!accounts || !productSelections || defaultsInitializedRef.current) {
      return;
    }

    defaultsInitializedRef.current = true;
    const defaultIds = productSelections
      .map((selection) => selection.socialAccountId)
      .filter((id) =>
        accounts.some(
          (account) => account.id === id && account.status === "connected",
        ),
      );

    setSelectedAccountIds(defaultIds);
    setTargets(
      Object.fromEntries(
        defaultIds.map((id) => {
          const account = accounts.find((item) => item.id === id)!;

          return [id, createSocialComposeTargetDraft(id, account.platform)];
        }),
      ),
    );
    setStatus("idle");
  }, [accounts, productSelections]);

  useEffect(() => {
    for (const account of selectedTikTokAccounts) {
      if (refreshedAccountIdsRef.current.has(account.id)) {
        continue;
      }

      refreshedAccountIdsRef.current.add(account.id);
      void refreshSocialAccountCapabilities(account.id).catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load current TikTok posting choices.",
        );
      });
    }
  }, [selectedTikTokAccounts]);

  const handleAccountChange = (
    account: SocialComposeAccount,
    checked: boolean,
  ) => {
    setConsentAcknowledged(false);
    setSelectedAccountIds((current) =>
      checked
        ? [...new Set([...current, account.id])]
        : current.filter((id) => id !== account.id),
    );
    setTargets((current) => ({
      ...current,
      [account.id]:
        current[account.id] ??
        createSocialComposeTargetDraft(account.id, account.platform),
    }));
  };

  const handleSchedule = async () => {
    if (status === "complete") {
      return;
    }

    setError(null);

    try {
      if (!selectedAccounts.length) {
        throw new Error("Choose at least one connected account.");
      }

      if (hasMissingTikTokChoices) {
        throw new Error(
          "Wait for TikTok choices to load, then choose who can watch each direct post.",
        );
      }

      if (hasIncompleteTikTokDisclosure) {
        throw new Error(
          "Choose the promotion type for each TikTok commercial post.",
        );
      }

      if (hasTikTokDurationConflict) {
        throw new Error(
          "This video is longer than the selected TikTok account currently accepts.",
        );
      }

      if (!consentAcknowledged) {
        throw new Error("Review the post and confirm before scheduling.");
      }

      let scheduledFor: string | undefined;

      if (schedule.mode === "exact_time") {
        scheduledFor = getFutureIsoDateTime(schedule.scheduledFor);
      }

      setStatus("rendering");
      setProgress(0);
      const renderResult = await onRenderMedia({
        musicTrack: null,
        onProgress: (value) => setProgress(Math.min(value * 0.7, 0.7)),
        platforms: selectedPlatforms,
      });

      if (!renderResult.mediaFiles.length) {
        throw new Error("This post does not have any media yet.");
      }

      setStatus("uploading");
      setProgress(0.76);
      const postId = crypto.randomUUID();
      const assets = (
        await uploadSocialPostAssets(postId, renderResult.mediaFiles)
      ).map((asset) => ({
        ...asset,
        ...(asset.kind === "video"
          ? {
              durationSeconds: asset.durationSeconds ?? videoDurationSeconds,
              height: asset.height ?? videoHeight,
              width: asset.width ?? videoWidth,
            }
          : {}),
      }));
      const now = new Date().toISOString();

      setStatus("saving");
      setProgress(0.92);
      await createPost({
        id: postId,
        productId,
        sourceId,
        sourceType,
        title,
        caption,
        scheduleMode: schedule.mode,
        scheduledFor,
        assets,
        targets: selectedAccounts.map((account) => ({
          id: crypto.randomUUID(),
          socialAccountId: account.id,
          publishMode: targets[account.id].publishMode,
          controlsJson: createSocialTargetControlsJson(
            targets[account.id],
            consentAcknowledged,
          ),
        })),
        now,
      });
      setProgress(1);
      setStatus("complete");
      onScheduled?.(postId);
    } catch (nextError) {
      setStatus("idle");
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to schedule this post.",
      );
    }
  };

  const statusMessage =
    status === "loading"
      ? "Loading connected accounts..."
      : status === "rendering"
        ? "Building the final media..."
        : status === "uploading"
          ? "Saving the media..."
          : status === "saving"
            ? "Adding the post to your schedule..."
            : status === "complete"
              ? "This post is on your schedule."
              : null;

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-publish-dialog-title"
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Review and schedule
            </p>
            <h2
              id="social-publish-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {sourceTitle}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close post dialog"
            disabled={isBusy}
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </header>

        <div className="grid gap-5 p-4 sm:p-5">
          {previewUrl ? (
            <div
              aria-label={`Preview of ${sourceTitle}`}
              className="aspect-video min-h-40 rounded-lg bg-slate-950 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          ) : null}
          <label className="grid gap-1 text-sm font-bold text-text-primary">
            Post title
            <input
              className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm font-normal"
              value={title}
              disabled={isBusy}
              maxLength={90}
              onChange={(event) => {
                setConsentAcknowledged(false);
                setTitle(event.currentTarget.value);
              }}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold text-text-primary">
            Caption and hashtags
            <textarea
              className="min-h-32 rounded-lg border border-border bg-white px-3 py-2 text-sm font-normal leading-6"
              value={caption}
              disabled={isBusy}
              maxLength={2200}
              onChange={(event) => {
                setConsentAcknowledged(false);
                setCaption(event.currentTarget.value);
              }}
            />
            <span className="text-right text-xs font-semibold text-text-tertiary">
              {caption.length}/2,200
            </span>
          </label>
          <SocialComposeAccountPicker
            accounts={accounts ?? []}
            disabled={isBusy}
            selectedAccountIds={selectedAccountIds}
            onChange={handleAccountChange}
          />
          {selectedAccounts.length > 0 ? (
            <div className="grid gap-3">
              {selectedAccounts.map((account) => (
                <SocialComposeTargetControls
                  key={account.id}
                  account={account}
                  disabled={isBusy}
                  mediaKind={mediaKind}
                  target={targets[account.id]}
                  videoDurationSeconds={videoDurationSeconds}
                  onChange={(target) => {
                    setConsentAcknowledged(false);
                    setTargets((current) => ({
                      ...current,
                      [account.id]: target,
                    }));
                  }}
                />
              ))}
            </div>
          ) : null}
          <SocialComposeSchedulePicker
            disabled={isBusy}
            value={schedule}
            onChange={(nextSchedule) => {
              setConsentAcknowledged(false);
              setSchedule(nextSchedule);
            }}
          />
          <SocialConsentCheckbox
            checked={consentAcknowledged}
            disabled={isBusy}
            hasDirectTikTokTarget={hasDirectTikTokTarget}
            hasTikTokBrandedContent={hasTikTokBrandedContent}
            onChange={setConsentAcknowledged}
          />
          {statusMessage ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-text-secondary">
                {statusMessage}
              </p>
              {status !== "complete" ? <ProgressBar value={progress} /> : null}
            </div>
          ) : null}
          {error ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="flex justify-end">
            {status === "complete" ? (
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            ) : (
              <Button
                type="button"
                isLoading={isBusy}
                disabled={
                  !selectedAccounts.length ||
                  !consentAcknowledged ||
                  hasMissingTikTokChoices ||
                  hasIncompleteTikTokDisclosure ||
                  hasTikTokDurationConflict
                }
                onClick={() => void handleSchedule()}
              >
                {schedule.mode === "now"
                  ? "Approve and post"
                  : "Approve and schedule"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
