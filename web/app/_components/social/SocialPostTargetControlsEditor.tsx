"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/app/_components/ui/Button";
import { SocialComposeTargetControls } from "./SocialComposeTargetControls";
import { refreshSocialAccountCapabilities } from "@/lib/clipstitchr/client/refreshSocialAccountCapabilities";
import { createSocialTargetControlsJson } from "@/lib/clipstitchr/social/createSocialTargetControlsJson";
import { readSocialComposeTargetDraft } from "@/lib/clipstitchr/social/readSocialComposeTargetDraft";
import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";

type SocialPostTargetControlsEditorProps = {
  mediaKind: "video" | "image";
  onSaved?: () => void;
  target: SocialSchedulePost["targets"][number];
  videoDurationSeconds?: number;
};

export function SocialPostTargetControlsEditor({
  mediaKind,
  onSaved,
  target,
  videoDurationSeconds,
}: SocialPostTargetControlsEditorProps) {
  const updateControls = useMutation(
    api.socialPosts.updateSocialPostTargetControls
      .updateSocialPostTargetControls,
  );
  const [draft, setDraft] = useState(() =>
    readSocialComposeTargetDraft({
      accountId: target.socialAccountId,
      controlsJson: target.controlsJson,
      platform: target.platform,
      publishMode: target.publishMode,
    }),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (target.platform === "tiktok") {
      void refreshSocialAccountCapabilities(target.socialAccountId).catch(
        (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Unable to refresh TikTok posting choices.",
          );
        },
      );
    }
  }, [target.platform, target.socialAccountId]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateControls({
        id: target.id,
        publishMode: draft.publishMode,
        controlsJson: createSocialTargetControlsJson(draft, true),
        now: new Date().toISOString(),
      });
      setMessage("Destination choices saved.");
      onSaved?.();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save destination choices.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-3">
      <SocialComposeTargetControls
        account={{
          id: target.socialAccountId,
          platform: target.platform,
          username: target.username,
          displayName: target.displayName,
          status: "connected",
          capabilitySnapshotJson: target.capabilitySnapshotJson,
          capabilityCheckedAt: target.capabilityCheckedAt,
        }}
        disabled={isSaving}
        mediaKind={mediaKind}
        target={draft}
        videoDurationSeconds={videoDurationSeconds}
        onChange={setDraft}
      />
      {message ? (
        <p className="text-sm font-semibold text-emerald-300">{message}</p>
      ) : null}
      {error ? (
        <p className="text-sm font-semibold text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          isLoading={isSaving}
          onClick={() => void handleSave()}
        >
          Save destination choices
        </Button>
      </div>
    </div>
  );
}
