"use client";

import { Music2, Save } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";
import { formatCompactNumber } from "@/lib/clipstitchr/utils/formatCompactNumber";

type TikTokSoundCandidateListItemProps = {
  candidate: TikTokSoundCandidate;
  isSaving: boolean;
  onSave: (sourceUrl: string) => void | Promise<void>;
};

export function TikTokSoundCandidateListItem({
  candidate,
  isSaving,
  onSave,
}: TikTokSoundCandidateListItemProps) {
  return (
    <li className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-accent">
        <Music2 aria-hidden className="h-4 w-4" />
      </span>
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
        icon={<Save aria-hidden className="h-4 w-4" />}
        disabled={!candidate.sourceUrl}
        isLoading={isSaving}
        onClick={() => void onSave(candidate.sourceUrl ?? "")}
      >
        Save
      </Button>
    </li>
  );
}
