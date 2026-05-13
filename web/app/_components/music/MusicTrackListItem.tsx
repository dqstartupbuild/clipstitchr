"use client";

import { Check } from "lucide-react";
import { MusicTrackPreviewButton } from "@/app/_components/music/MusicTrackPreviewButton";
import { Button } from "@/app/_components/ui/Button";
import { Badge } from "@/app/_components/ui/Badge";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type MusicTrackListItemProps = {
  isSelected: boolean;
  track: SharedMusicTrack;
  onSelect: (track: SharedMusicTrack) => void | Promise<void>;
};

export function MusicTrackListItem({
  isSelected,
  track,
  onSelect,
}: MusicTrackListItemProps) {
  return (
    <li className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <MusicTrackPreviewButton trackId={track.id} trackTitle={track.title} />
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-text-primary">
            {track.title}
          </p>
          {track.isOwnedByCurrentUser ? <Badge>Mine</Badge> : null}
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-text-tertiary">
          {formatDuration(track.durationSeconds)}
          {track.tags.length ? ` . ${track.tags.slice(0, 4).join(", ")}` : ""}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant={isSelected ? "secondary" : "primary"}
        icon={isSelected ? <Check aria-hidden className="h-4 w-4" /> : null}
        onClick={() => void onSelect(track)}
      >
        {isSelected ? "Selected" : "Select"}
      </Button>
    </li>
  );
}
