import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { VideoCompressionEstimateResult } from "@/lib/clipstitchr/tools/videoCompressionEstimator/VideoCompressionEstimateResult";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

type VideoCompressionEstimatorResultsProps = {
  result: VideoCompressionEstimateResult;
};

export function VideoCompressionEstimatorResults({
  result,
}: VideoCompressionEstimatorResultsProps) {
  const reduction =
    result.minimumReductionPercent === null ||
    result.maximumReductionPercent === null
      ? "Add original size"
      : `${result.minimumReductionPercent.toFixed(1)}% to ${result.maximumReductionPercent.toFixed(1)}%`;

  return (
    <Panel className="p-5 md:p-6 lg:sticky lg:top-24">
      <PanelHeader
        eyebrow="Transparent estimate"
        title={`${formatBytes(result.estimatedMinimumBytes)} to ${formatBytes(result.estimatedMaximumBytes)}`}
        description="The center estimate is bitrate × duration ÷ 8. The range adds eight percent in either direction for planning variation."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Center estimate"
          value={formatBytes(result.estimatedBytes)}
          description="Before the planning range is applied."
        />
        <ToolMetricCard
          label="Data per minute"
          value={formatBytes(result.bytesPerMinute)}
          description="At the selected combined bitrate."
        />
        <ToolMetricCard
          label="Size change range"
          value={reduction}
          description="Negative means this scenario could be larger than the original."
        />
        <ToolMetricCard
          label="Estimated upload time"
          value={
            result.transferMaximumSeconds === 0
              ? "Add upload speed"
              : `${result.transferMinimumSeconds.toFixed(1)}s to ${result.transferMaximumSeconds.toFixed(1)}s`
          }
          description="Network overhead and connection changes are not included."
        />
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        Estimate only. This tool does not transcode, compress, repair, upload,
        or create a video file.
      </p>
    </Panel>
  );
}
