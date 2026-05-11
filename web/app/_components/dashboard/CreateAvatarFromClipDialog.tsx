"use client";

import { Sparkles, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { avatarLightingOptions } from "@/lib/clipstitchr/constants/avatarLightingOptions";
import { avatarStyleOptions } from "@/lib/clipstitchr/constants/avatarStyleOptions";
import { DEFAULT_AVATAR_STYLE_OPTION } from "@/lib/clipstitchr/constants/defaultAvatarStyleOption";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { AvatarIdentityMode } from "@/lib/clipstitchr/types/AvatarIdentityMode";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type CreateAvatarFromClipDialogProps = {
  clip: VideoClipMetadata;
  error: string | null;
  isGenerating: boolean;
  onClose: () => void;
  onCreate: (options: CreateAvatarFromUgcClipOptions) => Promise<boolean>;
};

const counts: AvatarPhotoGenerationCount[] = [3, 5, 10];

export function CreateAvatarFromClipDialog({
  clip,
  error,
  isGenerating,
  onClose,
  onCreate,
}: CreateAvatarFromClipDialogProps) {
  const posterUrl = useObjectUrl(clip.posterBlob);
  const [avatarDescription, setAvatarDescription] = useState(
    () => clip.mainPersonDescription ?? "",
  );
  const [avatarName, setAvatarName] = useState(() => `${clip.name} avatar`);
  const [context, setContext] = useState(() => clip.poseDescription ?? "");
  const [count, setCount] = useState<AvatarPhotoGenerationCount>(3);
  const [identityMode, setIdentityMode] =
    useState<AvatarIdentityMode>("similar");
  const [lighting, setLighting] =
    useState<AvatarLightingOption>("any");
  const [location, setLocation] = useState("");
  const [style, setStyle] = useState<AvatarStyleOption>(
    DEFAULT_AVATAR_STYLE_OPTION,
  );
  const canCreate =
    avatarDescription.trim().length > 0 && avatarName.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const didCreate = await onCreate({
      avatarDescription,
      avatarName,
      context,
      count,
      identityMode,
      lighting,
      location,
      style,
    });

    if (didCreate) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={isGenerating ? undefined : onClose}
    >
      <form
        aria-labelledby="create-avatar-from-clip-title"
        className="max-h-full w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Create avatar
            </p>
            <h2
              id="create-avatar-from-clip-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close avatar creator"
            icon={<X aria-hidden className="h-4 w-4" />}
            disabled={isGenerating}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <div className="overflow-hidden rounded-md border border-border bg-slate-100">
              {posterUrl ? (
                <span
                  aria-label={`${clip.name} poster`}
                  className="block aspect-[2/3] bg-cover bg-center bg-no-repeat"
                  role="img"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
              ) : (
                <span className="flex aspect-[2/3] items-center justify-center text-xs text-text-tertiary">
                  Poster loading
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <label>
              <span className="text-sm font-semibold text-text-primary">
                Avatar name
              </span>
              <input
                type="text"
                value={avatarName}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
                onChange={(event) => setAvatarName(event.currentTarget.value)}
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-text-primary">
                Person description
              </span>
              <textarea
                value={avatarDescription}
                rows={4}
                className="mt-1 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
                placeholder="Describe stable visual traits of the person in the clip"
                onChange={(event) =>
                  setAvatarDescription(event.currentTarget.value)
                }
              />
            </label>
            <div>
              <span
                id="create-avatar-identity-mode-label"
                className="text-sm font-semibold text-text-primary"
              >
                Identity
              </span>
              <div
                aria-labelledby="create-avatar-identity-mode-label"
                className="mt-1 grid max-w-md grid-cols-2 rounded-lg border border-border bg-slate-100 p-1"
                role="group"
              >
                {(
                  [
                    ["similar", "Similar but different"],
                    ["same", "Same person"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={identityMode === mode}
                    onClick={() => setIdentityMode(mode)}
                    className={[
                      "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
                      identityMode === mode
                        ? "bg-white text-accent shadow-sm"
                        : "text-text-secondary hover:text-text-primary",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-text-primary">
                  Location or scenario
                </span>
                <input
                  type="text"
                  value={location}
                  placeholder="Any"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
                  onChange={(event) => setLocation(event.currentTarget.value)}
                />
              </label>
              <label>
                <span className="text-sm font-semibold text-text-primary">
                  Context
                </span>
                <input
                  type="text"
                  value={context}
                  placeholder="What they are doing or how they pose"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
                  onChange={(event) => setContext(event.currentTarget.value)}
                />
              </label>
              <SelectInput
                label="Style"
                options={avatarStyleOptions}
                value={style}
                className="h-10"
                onChange={(event) =>
                  setStyle(event.currentTarget.value as AvatarStyleOption)
                }
              />
              <SelectInput
                label="Lighting"
                options={avatarLightingOptions}
                value={lighting}
                className="h-10"
                onChange={(event) =>
                  setLighting(
                    event.currentTarget.value as AvatarLightingOption,
                  )
                }
              />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
              <div>
                <span className="text-sm font-semibold text-text-primary">
                  Quantity
                </span>
                <div className="mt-1 inline-flex rounded-lg border border-border bg-slate-100 p-1">
                  {counts.map((nextCount) => (
                    <button
                      key={nextCount}
                      type="button"
                      aria-pressed={count === nextCount}
                      onClick={() => setCount(nextCount)}
                      className={[
                        "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
                        count === nextCount
                          ? "bg-white text-accent shadow-sm"
                          : "text-text-secondary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {nextCount}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                isLoading={isGenerating}
                disabled={!canCreate}
                icon={<Sparkles aria-hidden className="h-4 w-4" />}
              >
                {isGenerating ? "Creating..." : "Create Avatar"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
