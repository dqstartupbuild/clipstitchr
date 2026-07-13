import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { VideoCompressionEstimateInput } from "@/lib/clipstitchr/tools/videoCompressionEstimator/VideoCompressionEstimateInput";
import { videoCompressionEstimateLimits } from "@/lib/clipstitchr/tools/videoCompressionEstimator/videoCompressionEstimateLimits";

type VideoCompressionEstimatorFormProps = {
  onChange: (value: VideoCompressionEstimateInput) => void;
  value: VideoCompressionEstimateInput;
};

export function VideoCompressionEstimatorForm({
  onChange,
  value,
}: VideoCompressionEstimatorFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Your planning scenario"
        title="Enter duration and bitrate choices"
        description="Bitrate is the amount of video or audio data used each second. This calculator shows the math instead of claiming an exact encode."
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ToolNumberField
          id="compression-duration"
          label="Duration"
          description="Use the local file duration or enter it by hand."
          max={videoCompressionEstimateLimits.durationSeconds}
          step={0.1}
          suffix="sec"
          value={value.durationSeconds}
          onChange={(durationSeconds) =>
            onChange({ ...value, durationSeconds })
          }
        />
        <ToolNumberField
          id="compression-original-size"
          label="Original size"
          description="Optional. This is used only for the reduction comparison."
          max={videoCompressionEstimateLimits.originalBytes / 1_000_000}
          step={0.1}
          suffix="MB"
          value={(value.originalBytes ?? 0) / 1_000_000}
          onChange={(megabytes) =>
            onChange({ ...value, originalBytes: megabytes * 1_000_000 })
          }
        />
        <ToolNumberField
          id="compression-video-bitrate"
          label="Video bitrate"
          description="Your intended encoded video bitrate."
          max={videoCompressionEstimateLimits.videoBitrateKbps}
          suffix="kbps"
          value={value.videoBitrateKbps}
          onChange={(videoBitrateKbps) =>
            onChange({ ...value, videoBitrateKbps })
          }
        />
        <ToolNumberField
          id="compression-audio-bitrate"
          label="Audio bitrate"
          description="Your intended encoded audio bitrate."
          max={videoCompressionEstimateLimits.audioBitrateKbps}
          suffix="kbps"
          value={value.audioBitrateKbps}
          onChange={(audioBitrateKbps) =>
            onChange({ ...value, audioBitrateKbps })
          }
        />
        <ToolNumberField
          id="compression-upload-speed"
          label="Upload speed"
          description="Use your measured upload speed, not download speed."
          max={videoCompressionEstimateLimits.uploadMegabitsPerSecond}
          step={0.1}
          suffix="Mbps"
          value={value.uploadMegabitsPerSecond}
          onChange={(uploadMegabitsPerSecond) =>
            onChange({ ...value, uploadMegabitsPerSecond })
          }
        />
      </div>
    </Panel>
  );
}
