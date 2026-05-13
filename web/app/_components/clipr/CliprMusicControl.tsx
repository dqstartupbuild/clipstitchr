import { Music2, X } from "lucide-react";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type CliprMusicControlProps = {
  checked: boolean;
  selectedTrack: SharedMusicTrack | null;
  onChange: (checked: boolean) => void;
  onClearTrack: () => void;
  onSelectTrack: (track: SharedMusicTrack) => void | Promise<void>;
};

export function CliprMusicControl({
  checked,
  selectedTrack,
  onChange,
  onClearTrack,
  onSelectTrack,
}: CliprMusicControlProps) {
  return (
    <section className="lg:col-span-2">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Music2 aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Music</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Export track
          </h2>
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-3">
        <input
          type="checkbox"
          checked={checked}
          className="mt-1 h-4 w-4 accent-accent"
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <span className="text-sm leading-6 text-text-secondary">
          Generate background music for this Clip. Music stays editable and is
          mixed only when you export.
        </span>
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <MusicSelectorButton
          source="clipr"
          selectedTrackId={selectedTrack?.id}
          onSelectTrack={onSelectTrack}
        />
        {selectedTrack ? (
          <div className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
            <span className="max-w-[220px] truncate text-sm font-semibold text-text-secondary">
              {selectedTrack.title}
            </span>
            <IconButton
              type="button"
              label="Clear selected music"
              icon={<X aria-hidden className="h-3.5 w-3.5" />}
              onClick={onClearTrack}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
