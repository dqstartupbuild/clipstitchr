"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/app/_components/ui/Button";
import { ConfirmActionDialog } from "@/app/_components/ui/ConfirmActionDialog";
import { SocialConsentCheckbox } from "./SocialConsentCheckbox";
import { SocialPostTargetControlsEditor } from "./SocialPostTargetControlsEditor";
import { formatIsoDateTimeForLocalInput } from "@/lib/clipstitchr/social/formatIsoDateTimeForLocalInput";
import { getFutureIsoDateTime } from "@/lib/clipstitchr/social/getFutureIsoDateTime";
import { getSocialConsentContext } from "@/lib/clipstitchr/social/getSocialConsentContext";
import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";

type SocialPostActionsProps = {
  post: SocialSchedulePost;
};

export function SocialPostActions({ post }: SocialPostActionsProps) {
  const cancelPost = useMutation(
    api.socialPosts.cancelSocialPost.cancelSocialPost,
  );
  const updatePost = useMutation(
    api.socialPosts.updateSocialPost.updateSocialPost,
  );
  const resumePost = useMutation(
    api.socialPosts.reviewAndResumeSocialPost.reviewAndResumeSocialPost,
  );
  const reconcileTarget = useMutation(
    api.socialPosts.reconcileSocialPostTarget.reconcileSocialPostTarget,
  );
  const [title, setTitle] = useState(post.title);
  const [caption, setCaption] = useState(post.caption);
  const [scheduledFor, setScheduledFor] = useState(
    formatIsoDateTimeForLocalInput(post.scheduledFor),
  );
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeConsentAcknowledged, setResumeConsentAcknowledged] =
    useState(false);
  const hasPublishedTarget = post.targets.some(
    (target) => target.status === "published",
  );
  const canEdit = post.targets.every((target) =>
    ["scheduled", "held", "needs_attention", "failed"].includes(target.status),
  );
  const canResume = post.targets.some((target) =>
    ["held", "needs_attention", "failed"].includes(target.status),
  );
  const canCancel =
    !post.targets.some((target) =>
      [
        "publishing",
        "status_check",
        "outcome_unknown",
        "waiting_for_user",
      ].includes(target.status),
    ) && post.targets.some((target) => target.status !== "published");
  const resumeNeedsTime =
    post.scheduleMode !== "product_queue" || hasPublishedTarget;
  const consentContext = getSocialConsentContext(post.targets);

  const runAction = async (name: string, action: () => Promise<unknown>) => {
    setBusyAction(name);
    setMessage(null);
    setError(null);

    try {
      await action();
      setMessage("Saved.");
      return true;
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update this post.",
      );
      return false;
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <>
      <details className="border-t border-border pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Review and actions
        </summary>
        <div className="mt-4 grid gap-4">
          {canEdit ? (
            <div className="grid gap-3">
              <label>
                <span className="text-sm font-semibold text-text-primary">
                  Title
                </span>
                <input
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
                  value={title}
                  disabled={Boolean(busyAction)}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                />
              </label>
              <label>
                <span className="text-sm font-semibold text-text-primary">
                  Caption
                </span>
                <textarea
                  className="mt-1.5 min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  value={caption}
                  maxLength={2200}
                  disabled={Boolean(busyAction)}
                  onChange={(event) => setCaption(event.currentTarget.value)}
                />
              </label>
              {post.scheduleMode === "exact_time" ? (
                <label>
                  <span className="text-sm font-semibold text-text-primary">
                    Date and time
                  </span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
                    type="datetime-local"
                    value={scheduledFor}
                    disabled={Boolean(busyAction)}
                    onChange={(event) =>
                      setScheduledFor(event.currentTarget.value)
                    }
                  />
                </label>
              ) : null}
              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  isLoading={busyAction === "edit"}
                  onClick={() =>
                    void runAction("edit", () =>
                      updatePost({
                        id: post.id,
                        title,
                        caption,
                        ...(post.scheduleMode === "exact_time"
                          ? {
                              scheduledFor: getFutureIsoDateTime(scheduledFor),
                            }
                          : {}),
                        now: new Date().toISOString(),
                      }),
                    )
                  }
                >
                  Save changes
                </Button>
              </div>
            </div>
          ) : null}
          {canResume ? (
            <div className="rounded-lg bg-surface-elevated p-3">
              <p className="text-sm font-bold text-text-primary">
                Review before resuming
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Your plan must be active when this post is due. Missed queue
                posts move to the next open product time and never go out all at
                once.
              </p>
              <div className="mt-3 grid gap-3">
                {post.targets
                  .filter((target) =>
                    ["held", "needs_attention", "failed"].includes(
                      target.status,
                    ),
                  )
                  .map((target) => (
                    <SocialPostTargetControlsEditor
                      key={target.id}
                      mediaKind={post.assets[0]?.kind ?? "video"}
                      onSaved={() => setResumeConsentAcknowledged(false)}
                      target={target}
                      videoDurationSeconds={post.assets[0]?.durationSeconds}
                    />
                  ))}
              </div>
              {resumeNeedsTime ? (
                <label className="mt-3 block">
                  <span className="text-sm font-semibold text-text-primary">
                    New date and time
                  </span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
                    type="datetime-local"
                    value={scheduledFor}
                    disabled={Boolean(busyAction)}
                    onChange={(event) =>
                      setScheduledFor(event.currentTarget.value)
                    }
                  />
                </label>
              ) : null}
              <div className="mt-3">
                <SocialConsentCheckbox
                  checked={resumeConsentAcknowledged}
                  disabled={Boolean(busyAction)}
                  hasDirectTikTokTarget={consentContext.hasDirectTikTokTarget}
                  hasTikTokBrandedContent={
                    consentContext.hasTikTokBrandedContent
                  }
                  onChange={setResumeConsentAcknowledged}
                />
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  isLoading={busyAction === "resume"}
                  disabled={!resumeConsentAcknowledged}
                  onClick={() =>
                    void runAction("resume", () =>
                      resumePost({
                        id: post.id,
                        consentAcknowledged: resumeConsentAcknowledged,
                        ...(resumeNeedsTime
                          ? {
                              scheduledFor:
                                getFutureIsoDateTime(scheduledFor),
                            }
                          : {}),
                        now: new Date().toISOString(),
                      }),
                    )
                  }
                >
                  Review and resume
                </Button>
              </div>
            </div>
          ) : null}
          {canCancel ? (
            <div>
              <Button
                type="button"
                size="sm"
                variant="danger"
                isLoading={busyAction === "cancel"}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel future deliveries
              </Button>
            </div>
          ) : null}
          {message ? (
            <p className="text-sm font-semibold text-emerald-300">{message}</p>
          ) : null}
          {error ? (
            <p className="text-sm font-semibold text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <div className="divide-y divide-border">
            {post.targets.map((target) =>
              target.status === "outcome_unknown" ? (
                <div key={target.id} className="py-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isLoading={busyAction === `reconcile:${target.id}`}
                    onClick={() =>
                      void runAction(`reconcile:${target.id}`, () =>
                        reconcileTarget({
                          id: target.id,
                          now: new Date().toISOString(),
                        }),
                      )
                    }
                  >
                    Check @{target.username} without reposting
                  </Button>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </details>
      <ConfirmActionDialog
        confirmLabel="Cancel deliveries"
        description="Every destination that has not started yet will be canceled. Deliveries already sent will stay untouched."
        isLoading={busyAction === "cancel"}
        open={isCancelDialogOpen}
        title="Cancel future deliveries?"
        onConfirm={() => {
          void runAction("cancel", () =>
            cancelPost({
              id: post.id,
              now: new Date().toISOString(),
            }),
          ).then((didCancel) => {
            if (didCancel) {
              setIsCancelDialogOpen(false);
            }
          });
        }}
        onOpenChange={setIsCancelDialogOpen}
      />
    </>
  );
}
