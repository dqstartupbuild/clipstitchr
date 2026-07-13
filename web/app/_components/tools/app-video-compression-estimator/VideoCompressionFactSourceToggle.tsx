import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

type VideoCompressionFactSourceToggleProps = {
  durationSeconds: number;
  fileSize: number;
  onChange: (value: boolean) => void;
  value: boolean;
};

export function VideoCompressionFactSourceToggle({
  durationSeconds,
  fileSize,
  onChange,
  value,
}: VideoCompressionFactSourceToggleProps) {
  return (
    <label className="mt-4 flex items-start gap-3 rounded-lg border border-accent/25 bg-accent/10 p-4">
      <input
        type="checkbox"
        checked={value}
        className="mt-1"
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>
        <span className="block text-sm font-bold text-text-primary">
          Use this file&apos;s local facts
        </span>
        <span className="mt-1 block text-xs leading-5 text-text-secondary">
          {durationSeconds.toFixed(1)} seconds and {formatBytes(fileSize)}. Turn
          this off to compare manual duration and original-size values instead.
        </span>
      </span>
    </label>
  );
}
