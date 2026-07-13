import type { TikTokSafeZonePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/TikTokSafeZonePreset";

type SafeZoneObstructionLayerProps = {
  preset: TikTokSafeZonePreset;
};

export function SafeZoneObstructionLayer({
  preset,
}: SafeZoneObstructionLayerProps) {
  return preset.obstructions.map((obstruction) => (
    <div
      aria-hidden
      className="pointer-events-none absolute flex items-center justify-center border border-red-300/70 bg-red-500/25 p-1 text-center text-[10px] font-black leading-3 text-white shadow-sm"
      key={obstruction.id}
      style={{
        height: `${obstruction.height * 100}%`,
        left: `${obstruction.x * 100}%`,
        top: `${obstruction.y * 100}%`,
        width: `${obstruction.width * 100}%`,
      }}
    >
      <span className="rounded bg-black/60 px-1 py-0.5">
        {obstruction.label}
      </span>
    </div>
  ));
}
