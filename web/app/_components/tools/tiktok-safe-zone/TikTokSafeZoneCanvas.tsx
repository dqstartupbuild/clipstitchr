import { SafeZoneObstructionLayer } from "@/app/_components/tools/tiktok-safe-zone/SafeZoneObstructionLayer";
import { SafeZonePlannedTextBox } from "@/app/_components/tools/tiktok-safe-zone/SafeZonePlannedTextBox";
import type { PlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/PlannedTextBox";
import type { TikTokSafeZonePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/TikTokSafeZonePreset";

type TikTokSafeZoneCanvasProps = {
  box: PlannedTextBox;
  isClear: boolean;
  objectUrl: string | null;
  onBoxChange: (box: PlannedTextBox) => void;
  preset: TikTokSafeZonePreset;
};

export function TikTokSafeZoneCanvas({
  box,
  isClear,
  objectUrl,
  onBoxChange,
  preset,
}: TikTokSafeZoneCanvasProps) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-slate-800 shadow-xl">
        {objectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Local object URLs are not compatible with next/image.
          <img
            alt="Your local frame under the safe-zone overlay"
            className="absolute inset-0 h-full w-full object-cover"
            src={objectUrl}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-slate-700 to-slate-950 p-8 text-center text-sm font-semibold leading-6 text-white/75">
            Add a vertical frame to preview it here. You can still move the
            sample text and inspect the buffers now.
          </div>
        )}
        <SafeZoneObstructionLayer preset={preset} />
        <SafeZonePlannedTextBox
          box={box}
          isClear={isClear}
          onChange={onBoxChange}
        />
      </div>
      <p className="mt-3 text-center text-xs leading-5 text-text-tertiary">
        The preview fills a 9:16 canvas. Non-vertical images may be cropped.
      </p>
    </div>
  );
}
