"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { SocialPublishingAccountCheckbox } from "@/app/_components/socialPublishing/SocialPublishingAccountCheckbox";
import { SocialPublishingBatchCaptionEditor } from "@/app/_components/socialPublishing/SocialPublishingBatchCaptionEditor";
import { SocialPublishingSoundModePicker } from "@/app/_components/socialPublishing/SocialPublishingSoundModePicker";
import { SocialPublishingTikTokOptions } from "@/app/_components/socialPublishing/SocialPublishingTikTokOptions";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { fetchSocialPublishingAccountOptions } from "@/lib/clipstitchr/client/fetchSocialPublishingAccountOptions";
import { getSocialPublishingErrorMessage } from "@/lib/clipstitchr/client/getSocialPublishingErrorMessage";
import { queueSocialPublishingBatchItems } from "@/lib/clipstitchr/client/queueSocialPublishingBatchItems";
import type { SocialPublishingBatchQueueItem } from "@/lib/clipstitchr/types/SocialPublishingBatchQueueItem";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import type { SocialPublishingSoundMode } from "@/lib/clipstitchr/types/SocialPublishingSoundMode";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getSharedSocialPublishingTikTokPrivacyLevels } from "@/lib/clipstitchr/utils/getSharedSocialPublishingTikTokPrivacyLevels";

type SocialPublishingBatchQueueDialogProps = {
  allowMusic?: boolean;
  items: SocialPublishingBatchQueueItem[];
  onClose: () => void;
  onQueued?: () => void | Promise<void>;
};

export function SocialPublishingBatchQueueDialog({
  allowMusic = false,
  items,
  onClose,
  onQueued,
}: SocialPublishingBatchQueueDialogProps) {
  const [accounts, setAccounts] = useState<SocialPublishingSocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [captions, setCaptions] = useState(() => items.map((item) => item.caption));
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(0);
  const [musicTrack, setMusicTrack] = useState<SharedMusicTrack | null>(null);
  const [soundMode, setSoundMode] = useState<SocialPublishingSoundMode>("none");
  const [tiktokCommercialContentType, setTiktokCommercialContentType] =
    useState<SocialPublishingTikTokCommercialContentType>("brand_organic");
  const [tiktokConsentGiven, setTiktokConsentGiven] = useState(false);
  const [tiktokPrivacyLevel, setTiktokPrivacyLevel] = useState("");
  const [completedCount, setCompletedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "queueing" | "complete">("idle");
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isQueueSubmissionLocked = useRef(false);
  const isBusy = isAccountLoading || status === "queueing";
  const selectedAccountIdSet = useMemo(() => new Set(selectedAccountIds), [selectedAccountIds]);
  const selectedPlatforms = useMemo(
    () => accounts.filter((account) => selectedAccountIdSet.has(account.id)).map((account) => account.platform),
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
  const remainingCount = items.length - completedCount;
  const accountProductId = items[0]?.productId;

  useEffect(() => {
    let isCancelled = false;

    void fetchSocialPublishingAccountOptions(accountProductId)
      .then((options) => {
        if (!isCancelled) {
          setAccounts(options.accounts);
          setSelectedAccountIds(options.defaultSocialAccountIds);
        }
      })
      .catch((nextError) => {
        if (!isCancelled) {
          setError(
            getSocialPublishingErrorMessage(
              nextError,
              "Unable to load connected accounts.",
            ),
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsAccountLoading(false);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [accountProductId]);

  const handleAccountChange = (accountId: string, checked: boolean) => {
    setTiktokConsentGiven(false);
    setSelectedAccountIds((currentIds) =>
      checked ? [...new Set([...currentIds, accountId])] : currentIds.filter((id) => id !== accountId),
    );
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setTiktokConsentGiven(false);
    setCaptions((currentCaptions) =>
      currentCaptions.map((currentCaption, currentIndex) => currentIndex === index ? caption : currentCaption),
    );
  };

  const handleQueue = async () => {
    if (isQueueSubmissionLocked.current) {
      return;
    }

    isQueueSubmissionLocked.current = true;
    setError(null);
    let completedBeforeFailure = completedCount;

    try {
      if (!selectedAccountIds.length) {
        throw new Error("Choose at least one account.");
      }
      if (
        hasSelectedTikTokAccount &&
        (!resolvedTiktokPrivacyLevel || !tiktokConsentGiven)
      ) {
        throw new Error("Choose TikTok settings and confirm these posts first.");
      }
      setStatus("queueing");
      const selectedMusicTrack = allowMusic && soundMode === "manual" ? musicTrack : null;

      await queueSocialPublishingBatchItems({
        captions,
        items,
        musicTrack: selectedMusicTrack,
        onCompletedCountChange: (count) => {
          completedBeforeFailure = count;
          setCompletedCount(count);
        },
        onProgressChange: setProgress,
        platforms: selectedPlatforms,
        socialAccountIds: selectedAccountIds,
        startIndex: completedCount,
        tiktokCommercialContentType,
        tiktokConsentGiven,
        tiktokPrivacyLevel: resolvedTiktokPrivacyLevel,
      });

      setStatus("complete");
      await onQueued?.();
      setTimeout(onClose, 700);
    } catch (nextError) {
      setStatus("idle");
      const message = getSocialPublishingErrorMessage(
        nextError,
        "Unable to queue these posts.",
      );
      setError(
        completedBeforeFailure > 0
          ? `${message} ${completedBeforeFailure} already added. Continue to finish the rest.`
          : message,
      );
    } finally {
      isQueueSubmissionLocked.current = false;
    }
  };

  return (
    <div className="dashboard-dialog-viewport" onClick={isBusy ? undefined : onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="social-publishing-batch-dialog-title" className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div>
            <p className="text-sm font-semibold text-accent-dark">{items.length} selected</p>
            <h2 id="social-publishing-batch-dialog-title" className="mt-1 text-xl font-bold text-text-primary">Add selected posts to queue</h2>
            <p className="mt-1 text-sm font-semibold text-text-secondary">Choose once, then we’ll add each post to your queue.</p>
          </div>
          <IconButton type="button" label="Close batch queue dialog" disabled={isBusy} icon={<X aria-hidden className="h-4 w-4" />} onClick={onClose} />
        </div>
        <div className="grid gap-5 p-4 sm:p-5">
          <div className="grid gap-3">
            <p className="text-sm font-bold text-text-primary">Accounts</p>
            {isAccountLoading ? <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">Loading your connected accounts...</p> : accounts.length ? <div className="grid gap-2 sm:grid-cols-2">{accounts.map((account) => <SocialPublishingAccountCheckbox key={account.id} account={account} checked={selectedAccountIdSet.has(account.id)} disabled={isBusy} onChange={handleAccountChange} />)}</div> : <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">Connect TikTok, Instagram, or YouTube Shorts in Zernio first.</p>}
          </div>
          <SocialPublishingBatchCaptionEditor activeIndex={activeCaptionIndex} captions={captions} disabled={isBusy} titles={items.map((item) => item.title)} onActiveIndexChange={setActiveCaptionIndex} onCaptionChange={handleCaptionChange} />
          {hasSelectedTikTokAccount ? <SocialPublishingTikTokOptions commercialContentType={tiktokCommercialContentType} consentGiven={tiktokConsentGiven} consentLabel="I reviewed every selected post and approve publishing them to TikTok." disabled={isBusy} privacyLevel={resolvedTiktokPrivacyLevel} privacyLevels={tiktokPrivacyLevels} onCommercialContentTypeChange={(value) => { setTiktokCommercialContentType(value); setTiktokConsentGiven(false); }} onConsentGivenChange={setTiktokConsentGiven} onPrivacyLevelChange={(value) => { setTiktokPrivacyLevel(value); setTiktokConsentGiven(false); }} /> : null}
          {allowMusic ? <div className="grid gap-3"><SocialPublishingSoundModePicker disabled={isBusy} value={soundMode} onChange={setSoundMode} />{soundMode === "manual" ? <div className="flex flex-wrap items-center gap-3"><MusicSelectorButton disabled={isBusy} label={musicTrack ? "Change sound" : "Add sound"} selectedTrackId={musicTrack?.id} source="swipr" onSelectTrack={setMusicTrack} />{musicTrack ? <button type="button" className="text-sm font-semibold text-text-secondary underline-offset-4 hover:text-accent hover:underline" disabled={isBusy} onClick={() => setMusicTrack(null)}>Remove sound</button> : null}</div> : null}</div> : null}
          {status === "queueing" || status === "complete" ? <div className="grid gap-2" role="status" aria-live="polite"><p className="text-sm font-semibold text-text-secondary">{status === "complete" ? `Added ${items.length} posts to your queue.` : `Adding post ${Math.min(completedCount + 1, items.length)} of ${items.length} to your queue...`}</p><ProgressBar value={progress} /></div> : null}
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" disabled={isBusy} onClick={onClose}>Cancel</Button><Button type="button" isLoading={isBusy} disabled={status === "complete" || !accounts.length || !selectedAccountIds.length || (hasSelectedTikTokAccount && (!resolvedTiktokPrivacyLevel || !tiktokConsentGiven))} onClick={() => void handleQueue()}>{completedCount > 0 ? `Continue with ${remainingCount}` : `Add ${items.length} to queue`}</Button></div>
        </div>
      </div>
    </div>
  );
}
