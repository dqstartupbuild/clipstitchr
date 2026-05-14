import { DownloadStitchCard } from "@/app/_components/stitchr/DownloadStitchCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type DownloadStitchesPanelProps = {
  stitches: Stitch[];
  onLoadClip: (id: string) => Promise<VideoClip | null>;
};

export function DownloadStitchesPanel({
  onLoadClip,
  stitches,
}: DownloadStitchesPanelProps) {
  if (!stitches.length) {
    return null;
  }

  return (
    <Panel className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Finished ads</p>
        <h2 className="mt-2 text-lg font-bold text-text-primary">
          {stitches.length === 1
            ? stitches[0].name
            : `${stitches.length} ads ready`}
        </h2>
      </div>
      <div className="grid gap-3">
        {stitches.map((stitch) => (
          <DownloadStitchCard
            key={stitch.id}
            stitch={stitch}
            onLoadClip={onLoadClip}
          />
        ))}
      </div>
    </Panel>
  );
}
