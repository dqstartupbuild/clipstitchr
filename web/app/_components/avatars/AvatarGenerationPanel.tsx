"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { avatarLightingOptions } from "@/lib/clipstitchr/constants/avatarLightingOptions";
import { avatarStyleOptions } from "@/lib/clipstitchr/constants/avatarStyleOptions";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type AvatarGenerationPanelProps = {
  count: AvatarPhotoGenerationCount;
  isGenerating: boolean;
  lighting: AvatarLightingOption;
  location: string;
  selectedAvatar?: Avatar;
  selectedPhoto?: PhotoAssetMetadata;
  style: AvatarStyleOption;
  onCountChange: (count: AvatarPhotoGenerationCount) => void;
  onGenerate: () => void;
  onLightingChange: (lighting: AvatarLightingOption) => void;
  onLocationChange: (location: string) => void;
  onStyleChange: (style: AvatarStyleOption) => void;
};

const counts: AvatarPhotoGenerationCount[] = [3, 5, 10];

export function AvatarGenerationPanel({
  count,
  isGenerating,
  lighting,
  location,
  selectedAvatar,
  selectedPhoto,
  style,
  onCountChange,
  onGenerate,
  onLightingChange,
  onLocationChange,
  onStyleChange,
}: AvatarGenerationPanelProps) {
  const hasDescription = Boolean(selectedAvatar?.description?.trim());

  return (
    <Panel className="p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Generate scenarios
          </p>
          <h2 className="mt-2 text-xl font-bold text-text-primary">
            Create more photos of the selected avatar
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {selectedAvatar
              ? selectedAvatar.description ||
                "Upload or assign a photo that can populate this avatar description before generating."
              : "Select an avatar below to generate new scenario photos."}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm font-semibold text-text-primary">
              Quantity
            </span>
            <div className="mt-2 inline-flex rounded-lg border border-border bg-slate-100 p-1">
              {counts.map((nextCount) => (
                <button
                  key={nextCount}
                  type="button"
                  onClick={() => onCountChange(nextCount)}
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
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Location or scenario
            </span>
            <input
              type="text"
              value={location}
              placeholder="Any"
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              onChange={(event) => onLocationChange(event.currentTarget.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Style
            </span>
            <select
              value={style}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
              onChange={(event) =>
                onStyleChange(event.currentTarget.value as AvatarStyleOption)
              }
            >
              {avatarStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Lighting
            </span>
            <select
              value={lighting}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
              onChange={(event) =>
                onLightingChange(event.currentTarget.value as AvatarLightingOption)
              }
            >
              {avatarLightingOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            icon={<Sparkles aria-hidden className="h-4 w-4" />}
            isLoading={isGenerating}
            disabled={!selectedAvatar || !selectedPhoto || !hasDescription}
            onClick={onGenerate}
          >
            Generate Photos
          </Button>
        </div>
      </div>
    </Panel>
  );
}
