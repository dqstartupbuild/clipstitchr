"use client";

import { Check, Save } from "lucide-react";
import { TikTokSoundPreviewButton } from "@/app/_components/music/TikTokSoundPreviewButton";
import { Button } from "@/app/_components/ui/Button";
import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";
import { formatCompactNumber } from "@/lib/clipstitchr/utils/formatCompactNumber";

type TikTokSoundCandidateListItemProps = {
  candidate: TikTokSoundCandidate;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (sourceUrl: string) => void | Promise<void>;
};

export function TikTokSoundCandidateListItem({
  candidate,
  isSaved,
  isSaving,
  onSave,
}: TikTokSoundCandidateListItemProps) {
  return (
    <li className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <TikTokSoundPreviewButton
        playUrl={candidate.playUrl}
        title={candidate.title}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text-primary">
          {candidate.title}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-text-tertiary">
          {[candidate.author, formatCompactNumber(candidate.playCount)]
            .filter(Boolean)
            .join(" . ")}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        icon={
          isSaved ? (
            <Check aria-hidden className="h-4 w-4" />
          ) : (
            <Save aria-hidden className="h-4 w-4" />
          )
        }
        disabled={isSaved || !candidate.sourceUrl}
        isLoading={!isSaved && isSaving}
        onClick={() => void onSave(candidate.sourceUrl ?? "")}
      >
        {isSaved ? "Saved" : "Save"}
      </Button>
    </li>
  );
}
