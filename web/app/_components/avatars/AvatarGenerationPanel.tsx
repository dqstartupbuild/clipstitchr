"use client";

import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { avatarLightingOptions } from "@/lib/clipstitchr/constants/avatarLightingOptions";
import { avatarStyleOptions } from "@/lib/clipstitchr/constants/avatarStyleOptions";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type AvatarGenerationPanelProps = {
  context: string;
  count: AvatarPhotoGenerationCount;
  isGenerating: boolean;
  lighting: AvatarLightingOption;
  location: string;
  selectedAvatar?: Avatar;
  selectedPhoto?: PhotoAssetMetadata;
  style: AvatarStyleOption;
  onCountChange: (count: AvatarPhotoGenerationCount) => void;
  onContextChange: (context: string) => void;
  onGenerate: () => void;
  onLightingChange: (lighting: AvatarLightingOption) => void;
  onLocationChange: (location: string) => void;
  onStyleChange: (style: AvatarStyleOption) => void;
};

const counts: AvatarPhotoGenerationCount[] = [1, 3, 5];

export function AvatarGenerationPanel({
  context,
  count,
  isGenerating,
  lighting,
  location,
  selectedAvatar,
  selectedPhoto,
  style,
  onCountChange,
  onContextChange,
  onGenerate,
  onLightingChange,
  onLocationChange,
  onStyleChange,
}: AvatarGenerationPanelProps) {
  const hasDescription = Boolean(selectedAvatar?.description?.trim());
  const descriptionText = selectedAvatar
    ? selectedAvatar.description ||
      "Add one clear description for this avatar before generating."
    : "Select an avatar photo to enable generation.";
  const shouldShowControls = Boolean(selectedAvatar && selectedPhoto);

  return (
    <Panel className="p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="min-w-0 xl:flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
            Create avatar photos
          </p>
          <h2 className="mt-1 text-base font-bold text-text-primary">
            New photos from selected avatar
          </h2>
          <div className="group relative mt-1 max-w-3xl">
            <p
              className="line-clamp-2 text-sm leading-6 text-text-secondary outline-none focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              tabIndex={hasDescription ? 0 : undefined}
            >
              {descriptionText}
            </p>
            {hasDescription ? (
              <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-full max-w-xl rounded-lg border border-accent/20 bg-white p-3 text-sm leading-6 text-text-secondary shadow-xl shadow-slate-900/15 group-hover:block group-focus-within:block">
                {selectedAvatar?.description}
              </div>
            ) : null}
          </div>
        </div>
        {shouldShowControls ? (
          <div className="grid gap-2 md:grid-cols-2 xl:w-[760px] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)_132px_132px_108px_132px] xl:items-end">
            <label className="md:col-span-2 xl:col-span-1">
              <span className="text-sm font-semibold text-text-primary">
                Background
              </span>
              <input
                type="text"
                value={location}
                placeholder="Any"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
                onChange={(event) =>
                  onLocationChange(event.currentTarget.value)
                }
              />
            </label>
            <label className="md:col-span-2 xl:col-span-1">
              <span className="text-sm font-semibold text-text-primary">
                Pose or action
              </span>
              <input
                type="text"
                value={context}
                placeholder="Any"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
                onChange={(event) => onContextChange(event.currentTarget.value)}
              />
            </label>
            <SelectInput
              label="Style"
              options={avatarStyleOptions}
              value={style}
              className="h-9"
              onChange={(event) =>
                onStyleChange(event.currentTarget.value as AvatarStyleOption)
              }
            />
            <SelectInput
              label="Lighting"
              options={avatarLightingOptions}
              value={lighting}
              className="h-9"
              onChange={(event) =>
                onLightingChange(
                  event.currentTarget.value as AvatarLightingOption,
                )
              }
            />
            <div>
              <span className="text-sm font-semibold text-text-primary">
                Quantity
              </span>
              <div className="mt-1 inline-flex rounded-lg border border-border bg-slate-100 p-1">
                {counts.map((nextCount) => (
                  <button
                    key={nextCount}
                    type="button"
                    onClick={() => onCountChange(nextCount)}
                    className={[
                      "h-7 rounded-md px-2.5 text-sm font-semibold transition-colors",
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
              type="button"
              size="sm"
              className="w-full self-end"
              isLoading={isGenerating}
              disabled={!selectedAvatar || !selectedPhoto || !hasDescription}
              onClick={onGenerate}
            >
              {isGenerating ? "Working..." : "Create Photos"}
            </Button>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
