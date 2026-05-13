"use client";

import { Copy, Trash2 } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongrMusicTimelineCardProps = {
  clip: LongrMusicClip;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<LongrMusicClip>) => void;
};

export function LongrMusicTimelineCard({
  clip,
  onDuplicate,
  onRemove,
  onUpdate,
}: LongrMusicTimelineCardProps) {
  return (
    <div className="grid w-[260px] shrink-0 gap-3 rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {clip.trackTitle}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {formatDuration(clip.sourceEndSeconds - clip.sourceStartSeconds)}
          </p>
        </div>
        <div className="flex gap-1">
          <IconButton
            type="button"
            label="Duplicate music clip"
            icon={<Copy aria-hidden className="h-3.5 w-3.5" />}
            onClick={() => onDuplicate(clip.id)}
          />
          <IconButton
            type="button"
            label="Remove music clip"
            icon={<Trash2 aria-hidden className="h-3.5 w-3.5" />}
            onClick={() => onRemove(clip.id)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-text-tertiary">
            Start
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={Number(clip.timelineStartSeconds.toFixed(1))}
            className="mt-1 h-9 w-full rounded-md border border-border px-2 text-sm font-semibold"
            onChange={(event) =>
              onUpdate(clip.id, {
                timelineStartSeconds: Number(event.currentTarget.value),
              })
            }
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-text-tertiary">
            In
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={Number(clip.sourceStartSeconds.toFixed(1))}
            className="mt-1 h-9 w-full rounded-md border border-border px-2 text-sm font-semibold"
            onChange={(event) =>
              onUpdate(clip.id, {
                sourceStartSeconds: Number(event.currentTarget.value),
              })
            }
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-text-tertiary">
            Out
          </span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={Number(clip.sourceEndSeconds.toFixed(1))}
            className="mt-1 h-9 w-full rounded-md border border-border px-2 text-sm font-semibold"
            onChange={(event) =>
              onUpdate(clip.id, {
                sourceEndSeconds: Number(event.currentTarget.value),
              })
            }
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] font-bold uppercase text-text-tertiary">
          Volume
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(clip.volume * 100)}
          className="mt-2 w-full accent-accent"
          onChange={(event) =>
            onUpdate(clip.id, {
              volume: Number(event.currentTarget.value) / 100,
            })
          }
        />
      </label>
    </div>
  );
}
