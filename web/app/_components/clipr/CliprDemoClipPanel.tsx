"use client";

import { MonitorPlay } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type CliprDemoClipPanelProps = {
  clips: VideoClipMetadata[];
  selectedClipId: string;
  onChange: (clipId: string) => void;
};

export function CliprDemoClipPanel({
  clips,
  selectedClipId,
  onChange,
}: CliprDemoClipPanelProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <MonitorPlay aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Demo</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Source video
          </h2>
        </div>
      </div>
      <SelectInput
        label="Demo video"
        value={selectedClipId}
        options={clips.map((clip) => ({
          label: clip.name,
          value: clip.id,
        }))}
        disabled={!clips.length}
        onChange={(event) => onChange(event.target.value)}
      />
      {!clips.length ? (
        <p className="mt-3 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          Add a demo video before using Demo mode.
        </p>
      ) : null}
    </section>
  );
}
