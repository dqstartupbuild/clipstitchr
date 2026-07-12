"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { PostBridgeAccountCheckbox } from "@/app/_components/postBridge/PostBridgeAccountCheckbox";
import { PostBridgeBatchCaptionEditor } from "@/app/_components/postBridge/PostBridgeBatchCaptionEditor";
import { PostBridgeSoundModePicker } from "@/app/_components/postBridge/PostBridgeSoundModePicker";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import { queuePostBridgeBatchItems } from "@/lib/clipstitchr/client/queuePostBridgeBatchItems";
import type { PostBridgeBatchQueueItem } from "@/lib/clipstitchr/types/PostBridgeBatchQueueItem";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import type { PostBridgeSoundMode } from "@/lib/clipstitchr/types/PostBridgeSoundMode";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type PostBridgeBatchQueueDialogProps = {
  allowMusic?: boolean;
  items: PostBridgeBatchQueueItem[];
  onClose: () => void;
  onQueued?: () => void | Promise<void>;
};

export function PostBridgeBatchQueueDialog({
  allowMusic = false,
  items,
  onClose,
  onQueued,
}: PostBridgeBatchQueueDialogProps) {
  const [accounts, setAccounts] = useState<PostBridgeSocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [captions, setCaptions] = useState(() => items.map((item) => item.caption));
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(0);
  const [musicTrack, setMusicTrack] = useState<SharedMusicTrack | null>(null);
  const [soundMode, setSoundMode] = useState<PostBridgeSoundMode>("none");
  const [completedCount, setCompletedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"loading" | "idle" | "queueing" | "complete">("loading");
  const [error, setError] = useState<string | null>(null);
  const isBusy = status === "loading" || status === "queueing";
  const selectedAccountIdSet = useMemo(() => new Set(selectedAccountIds), [selectedAccountIds]);
  const selectedPlatforms = useMemo(
    () => accounts.filter((account) => selectedAccountIdSet.has(account.id)).map((account) => account.platform),
    [accounts, selectedAccountIdSet],
  );

  useEffect(() => {
    let isCancelled = false;
    void fetchPostBridgeAccountOptions(items[0]?.productId)
      .then((options) => {
        if (!isCancelled) {
          setAccounts(options.accounts);
          setSelectedAccountIds(options.defaultSocialAccountIds);
          setStatus("idle");
        }
      })
      .catch((nextError) => {
        if (!isCancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load connected accounts.");
          setStatus("idle");
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [items]);

  const handleAccountChange = (accountId: number, checked: boolean) => {
    setSelectedAccountIds((currentIds) =>
      checked ? [...new Set([...currentIds, accountId])] : currentIds.filter((id) => id !== accountId),
    );
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setCaptions((currentCaptions) =>
      currentCaptions.map((currentCaption, currentIndex) => currentIndex === index ? caption : currentCaption),
    );
  };

  const handleQueue = async () => {
    setError(null);
    try {
      if (!selectedAccountIds.length) {
        throw new Error("Choose at least one account.");
      }
      setStatus("queueing");
      const selectedMusicTrack = allowMusic && soundMode === "manual" ? musicTrack : null;

      await queuePostBridgeBatchItems({
        captions,
        items,
        musicTrack: selectedMusicTrack,
        onCompletedCountChange: setCompletedCount,
        onProgressChange: setProgress,
        platforms: selectedPlatforms,
        socialAccountIds: selectedAccountIds,
      });

      setStatus("complete");
      await onQueued?.();
      setTimeout(onClose, 700);
    } catch (nextError) {
      setStatus("idle");
      setError(nextError instanceof Error ? nextError.message : "Unable to queue these posts.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-3 py-4 sm:items-center sm:px-4 sm:py-6" onClick={isBusy ? undefined : onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="post-bridge-batch-dialog-title" className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div>
            <p className="text-sm font-semibold text-accent-dark">{items.length} selected</p>
            <h2 id="post-bridge-batch-dialog-title" className="mt-1 text-xl font-bold text-text-primary">Add selected posts to queue</h2>
            <p className="mt-1 text-sm font-semibold text-text-secondary">Choose once, then we’ll add each post to your queue.</p>
          </div>
          <IconButton type="button" label="Close batch queue dialog" disabled={isBusy} icon={<X aria-hidden className="h-4 w-4" />} onClick={onClose} />
        </div>
        <div className="grid gap-5 p-4 sm:p-5">
          <div className="grid gap-3">
            <p className="text-sm font-bold text-text-primary">Accounts</p>
            {accounts.length ? <div className="grid gap-2 sm:grid-cols-2">{accounts.map((account) => <PostBridgeAccountCheckbox key={account.id} account={account} checked={selectedAccountIdSet.has(account.id)} disabled={isBusy} onChange={handleAccountChange} />)}</div> : <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">Connect TikTok, Instagram, or YouTube Shorts in Post Bridge first.</p>}
          </div>
          <PostBridgeBatchCaptionEditor activeIndex={activeCaptionIndex} captions={captions} disabled={isBusy} titles={items.map((item) => item.title)} onActiveIndexChange={setActiveCaptionIndex} onCaptionChange={handleCaptionChange} />
          {allowMusic ? <div className="grid gap-3"><PostBridgeSoundModePicker disabled={isBusy} value={soundMode} onChange={setSoundMode} />{soundMode === "manual" ? <div className="flex flex-wrap items-center gap-3"><MusicSelectorButton disabled={isBusy} label={musicTrack ? "Change sound" : "Add sound"} selectedTrackId={musicTrack?.id} source="swipr" onSelectTrack={setMusicTrack} />{musicTrack ? <button type="button" className="text-sm font-semibold text-text-secondary underline-offset-4 hover:text-accent hover:underline" disabled={isBusy} onClick={() => setMusicTrack(null)}>Remove sound</button> : null}</div> : null}</div> : null}
          {status === "queueing" || status === "complete" ? <div className="grid gap-2"><p className="text-sm font-semibold text-text-secondary">{status === "complete" ? `Added ${items.length} posts to your queue.` : `Adding post ${Math.min(completedCount + 1, items.length)} of ${items.length} to your queue...`}</p><ProgressBar value={progress} /></div> : null}
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" disabled={isBusy} onClick={onClose}>Cancel</Button><Button type="button" isLoading={isBusy} disabled={status === "complete" || !accounts.length || !selectedAccountIds.length} onClick={() => void handleQueue()}>Add {items.length} to queue</Button></div>
        </div>
      </div>
    </div>
  );
}
