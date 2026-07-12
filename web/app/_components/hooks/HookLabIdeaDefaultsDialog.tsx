"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { HookLabIdeaDefaults } from "@/lib/clipstitchr/types/HookLabIdeaDefaults";
import type { HookLabResolvedDefaults } from "@/lib/clipstitchr/types/HookLabResolvedDefaults";

type HookLabIdeaDefaultsDialogProps = {
  defaults: HookLabIdeaDefaults;
  error: string | null;
  isUsing: boolean;
  onClose: () => void;
  onContinue: (defaults: HookLabResolvedDefaults) => void;
};

export function HookLabIdeaDefaultsDialog({
  defaults,
  error,
  isUsing,
  onClose,
  onContinue,
}: HookLabIdeaDefaultsDialogProps) {
  const [avatarId, setAvatarId] = useState(
    defaults.defaultAvatarId ?? defaults.avatars[0]?.id ?? "",
  );
  const [demoClipId, setDemoClipId] = useState(
    defaults.defaultDemoClipId ?? defaults.demoClips[0]?.id ?? "",
  );
  const [saveDefaults, setSaveDefaults] = useState(true);
  const needsAvatar = !defaults.defaultAvatarId;
  const needsDemo = !defaults.defaultDemoClipId;
  const canContinue = avatarId.length > 0 && demoClipId.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        aria-labelledby="hook-lab-defaults-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-lg border border-border bg-white p-5 shadow-xl"
        role="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue({
            defaultAvatarId: avatarId,
            defaultDemoClipId: demoClipId,
            saveDefaults,
          });
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              One quick choice
            </p>
            <h2
              id="hook-lab-defaults-title"
              className="mt-1 text-balance text-xl font-bold text-text-primary"
            >
              Choose what this idea should use
            </h2>
            <p className="mt-1 text-pretty text-sm leading-6 text-text-secondary">
              We only ask for the missing pieces. Next time, one click can start
              the fresh Stitch.
            </p>
          </div>
          <IconButton
            type="button"
            label="Close defaults dialog"
            icon={<X aria-hidden className="size-4" />}
            disabled={isUsing}
            onClick={onClose}
          />
        </div>
        <div className="mt-5 grid gap-4">
          {needsAvatar ? (
            <SelectInput
              label="Avatar"
              value={avatarId}
              options={[
                { label: "Choose an avatar", value: "" },
                ...defaults.avatars.map((avatar) => ({
                  label: avatar.name,
                  value: avatar.id,
                })),
              ]}
              onChange={(event) => setAvatarId(event.currentTarget.value)}
            />
          ) : null}
          {needsDemo ? (
            <SelectInput
              label="Product demo"
              value={demoClipId}
              options={[
                { label: "Choose a demo", value: "" },
                ...defaults.demoClips.map((clip) => ({
                  label: clip.name,
                  value: clip.id,
                })),
              ]}
              onChange={(event) => setDemoClipId(event.currentTarget.value)}
            />
          ) : null}
          {needsAvatar || needsDemo ? (
            <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted p-3">
              <input
                type="checkbox"
                checked={saveDefaults}
                className="mt-0.5 size-4 rounded border-border text-accent focus:ring-accent"
                onChange={(event) => setSaveDefaults(event.currentTarget.checked)}
              />
              <span className="text-pretty text-sm font-semibold text-text-secondary">
                Save these choices for the next idea.
              </span>
            </label>
          ) : null}
        </div>
        {!defaults.avatars.length && needsAvatar ? (
          <p className="mt-3 text-pretty text-sm font-semibold text-amber-700">
            Add an avatar before using this idea.
          </p>
        ) : null}
        {!defaults.demoClips.length && needsDemo ? (
          <p className="mt-3 text-pretty text-sm font-semibold text-amber-700">
            Add a product demo before using this idea.
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-pretty text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isUsing}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canContinue} isLoading={isUsing}>
            Create Stitch
          </Button>
        </div>
      </form>
    </div>
  );
}
