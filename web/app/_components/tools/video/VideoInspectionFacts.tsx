import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { formatBitrate } from "@/lib/clipstitchr/tools/localVideoInspection/formatBitrate";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type VideoInspectionFactsProps = {
  inspection: LocalVideoInspection;
};

export function VideoInspectionFacts({
  inspection,
}: VideoInspectionFactsProps) {
  const facts = [
    {
      label: "Display size",
      value: `${inspection.width}×${inspection.height}`,
    },
    { label: "Length", value: formatDuration(inspection.duration) },
    {
      label: "Frame rate",
      value: inspection.videoFrameRate
        ? `${inspection.videoFrameRate.toFixed(1)} FPS`
        : "Not available",
    },
    {
      label: "Video codec",
      value: inspection.videoCodecParameter ?? inspection.videoCodec ?? "Unknown",
    },
    { label: "Video bitrate", value: formatBitrate(inspection.videoBitrate) },
    {
      label: "Audio",
      value: inspection.hasAudio
        ? inspection.audioCodecParameter ?? inspection.audioCodec ?? "Present"
        : "No audio",
    },
    { label: "File size", value: formatBytes(inspection.fileSize) },
    {
      label: "Rotation",
      value: `${inspection.rotation}°`,
    },
  ];

  return (
    <section aria-labelledby="video-facts-heading">
      <h3 id="video-facts-heading" className="text-lg font-bold text-text-primary">
        File facts
      </h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div
            className="rounded-lg border border-border bg-surface-elevated p-4"
            key={fact.label}
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
              {fact.label}
            </dt>
            <dd className="mt-2 break-words text-sm font-bold text-text-primary">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
