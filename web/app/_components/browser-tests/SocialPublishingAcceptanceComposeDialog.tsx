"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { SocialComposeAccountPicker } from "@/app/_components/social/SocialComposeAccountPicker";
import { SocialComposeSchedulePicker } from "@/app/_components/social/SocialComposeSchedulePicker";
import { SocialComposeTargetControls } from "@/app/_components/social/SocialComposeTargetControls";
import { SocialConsentCheckbox } from "@/app/_components/social/SocialConsentCheckbox";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { socialPublishingAcceptanceAccounts } from "./socialPublishingAcceptanceAccounts";
import { useDialogFocusManagement } from "@/lib/clipstitchr/hooks/useDialogFocusManagement";
import { createSocialComposeTargetDraft } from "@/lib/clipstitchr/social/createSocialComposeTargetDraft";
import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";
import type { SocialComposeScheduleDraft } from "@/lib/clipstitchr/social/types/SocialComposeScheduleDraft";
import type { SocialComposeTargetDraft } from "@/lib/clipstitchr/social/types/SocialComposeTargetDraft";

type SocialPublishingAcceptanceComposeDialogProps = {
  onClose: () => void;
  onComplete: () => void;
};

export function SocialPublishingAcceptanceComposeDialog({
  onClose,
  onComplete,
}: SocialPublishingAcceptanceComposeDialogProps) {
  const [mediaKind, setMediaKind] = useState<"video" | "image">("video");
  const [title, setTitle] = useState("Summer product demo");
  const [caption, setCaption] = useState(
    "A quick look at the latest ClipStitchr workflow.",
  );
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [targets, setTargets] = useState<
    Record<string, SocialComposeTargetDraft>
  >({});
  const [schedule, setSchedule] = useState<SocialComposeScheduleDraft>({
    mode: "product_queue",
    scheduledFor: "",
  });
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const dialogRef = useDialogFocusManagement(onClose);
  const selectedAccounts = useMemo(
    () =>
      socialPublishingAcceptanceAccounts.filter((account) =>
        selectedAccountIds.includes(account.id),
      ),
    [selectedAccountIds],
  );
  const selectedTikTokTargets = selectedAccounts
    .filter((account) => account.platform === "tiktok")
    .map((account) => targets[account.id])
    .filter(Boolean);
  const hasIncompleteTikTokPrivacy = selectedTikTokTargets.some(
    (target) => target.publishMode === "direct" && !target.privacyLevel,
  );
  const hasDirectTikTokTarget = selectedTikTokTargets.some(
    (target) => target.publishMode === "direct",
  );
  const hasTikTokBrandedContent = selectedTikTokTargets.some(
    (target) => target.publishMode === "direct" && target.brandContentToggle,
  );
  const canComplete =
    selectedAccounts.length > 0 &&
    consentAcknowledged &&
    !hasIncompleteTikTokPrivacy;

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

  return (
    <div className="dashboard-dialog-viewport" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-browser-compose-title"
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Browser acceptance fixture
            </p>
            <h2
              id="social-browser-compose-title"
              className="mt-1 text-xl font-bold text-text-primary"
            >
              Review and schedule a post
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close post dialog"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </header>

        <div className="grid gap-5 p-4 sm:p-5">
          <fieldset>
            <legend className="text-sm font-bold text-text-primary">
              Media type
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-surface-muted px-3 text-sm font-semibold text-text-primary">
                <input
                  type="radio"
                  name="social-browser-media-kind"
                  checked={mediaKind === "video"}
                  onChange={() => {
                    setConsentAcknowledged(false);
                    setMediaKind("video");
                  }}
                />
                Video
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-surface-muted px-3 text-sm font-semibold text-text-primary">
                <input
                  type="radio"
                  name="social-browser-media-kind"
                  checked={mediaKind === "image"}
                  onChange={() => {
                    setConsentAcknowledged(false);
                    setMediaKind("image");
                  }}
                />
                Photo slideshow
              </label>
            </div>
          </fieldset>

          <label className="grid gap-1 text-sm font-bold text-text-primary">
            Post title
            <input
              className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm font-normal"
              value={title}
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
              className="min-h-28 rounded-lg border border-border bg-white px-3 py-2 text-sm font-normal leading-6"
              value={caption}
              maxLength={2200}
              onChange={(event) => {
                setConsentAcknowledged(false);
                setCaption(event.currentTarget.value);
              }}
            />
          </label>

          <SocialComposeAccountPicker
            accounts={socialPublishingAcceptanceAccounts}
            disabled={false}
            selectedAccountIds={selectedAccountIds}
            onChange={handleAccountChange}
          />

          {selectedAccounts.length > 0 ? (
            <div className="grid gap-3">
              {selectedAccounts.map((account) => (
                <SocialComposeTargetControls
                  key={account.id}
                  account={account}
                  disabled={false}
                  mediaKind={mediaKind}
                  target={targets[account.id]}
                  videoDurationSeconds={45}
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
            disabled={false}
            value={schedule}
            onChange={(nextSchedule) => {
              setConsentAcknowledged(false);
              setSchedule(nextSchedule);
            }}
          />

          <SocialConsentCheckbox
            checked={consentAcknowledged}
            disabled={false}
            hasDirectTikTokTarget={hasDirectTikTokTarget}
            hasTikTokBrandedContent={hasTikTokBrandedContent}
            onChange={setConsentAcknowledged}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!canComplete}
              onClick={onComplete}
            >
              {schedule.mode === "now"
                ? "Approve and post"
                : "Approve and schedule"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
