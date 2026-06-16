"use client";

import { Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import { getPexelsPhotoDownloadUrl } from "@/lib/clipstitchr/utils/getPexelsPhotoDownloadUrl";

type PexelsPhotoCardProps = {
  isSaving: boolean;
  photo: PexelsPhotoResult;
  onSelect: (photo: PexelsPhotoResult) => void;
};

export function PexelsPhotoCard({
  isSaving,
  photo,
  onSelect,
}: PexelsPhotoCardProps) {
  return (
    <article className="w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
      <div
        role="img"
        aria-label={photo.alt || `Photo by ${photo.photographer || "Pexels"}`}
        className="aspect-[9/16] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getPexelsPhotoDownloadUrl(photo)})` }}
      />
      <div className="grid gap-2 p-2">
        {photo.photographerUrl ? (
          <a
            className="truncate text-xs font-semibold text-text-secondary underline-offset-2 hover:underline"
            href={photo.photographerUrl}
            rel="noreferrer"
            target="_blank"
          >
            {photo.photographer || "Pexels"}
          </a>
        ) : (
          <p className="truncate text-xs font-semibold text-text-secondary">
            {photo.photographer || "Pexels"}
          </p>
        )}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Plus aria-hidden className="h-4 w-4" />}
          disabled={isSaving}
          onClick={() => onSelect(photo)}
        >
          Add
        </Button>
      </div>
    </article>
  );
}
