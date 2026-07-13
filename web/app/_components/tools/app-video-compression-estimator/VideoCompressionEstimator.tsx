"use client";

import { useState } from "react";
import { VideoCompressionFactSourceToggle } from "@/app/_components/tools/app-video-compression-estimator/VideoCompressionFactSourceToggle";
import { VideoCompressionEstimatorForm } from "@/app/_components/tools/app-video-compression-estimator/VideoCompressionEstimatorForm";
import { VideoCompressionEstimatorResults } from "@/app/_components/tools/app-video-compression-estimator/VideoCompressionEstimatorResults";
import { LocalVideoDropzone } from "@/app/_components/tools/video/LocalVideoDropzone";
import { calculateVideoCompressionEstimate } from "@/lib/clipstitchr/tools/videoCompressionEstimator/calculateVideoCompressionEstimate";
import { defaultVideoCompressionEstimateInput } from "@/lib/clipstitchr/tools/videoCompressionEstimator/defaultVideoCompressionEstimateInput";
import type { VideoCompressionEstimateInput } from "@/lib/clipstitchr/tools/videoCompressionEstimator/VideoCompressionEstimateInput";
import { useLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/useLocalVideoInspection";

export function VideoCompressionEstimator() {
  const [input, setInput] = useState<VideoCompressionEstimateInput>(
    defaultVideoCompressionEstimateInput,
  );
  const [useFileFacts, setUseFileFacts] = useState(true);
  const { errorMessage, file, inspectFile, inspection, isInspecting } =
    useLocalVideoInspection();
  const effectiveInput =
    inspection && useFileFacts
      ? {
          ...input,
          durationSeconds: inspection.duration,
          originalBytes: inspection.fileSize,
        }
      : input;

  return (
    <section className="px-6 py-16" aria-label="Video compression estimator">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <LocalVideoDropzone
            emptyPrompt="Choose a video to fill in local facts"
            errorMessage={errorMessage}
            file={file}
            inputId="compression-estimator-file"
            isInspecting={isInspecting}
            onFile={(nextFile) => {
              setUseFileFacts(true);
              void inspectFile(nextFile);
            }}
          />
          {inspection ? (
            <VideoCompressionFactSourceToggle
              durationSeconds={inspection.duration}
              fileSize={inspection.fileSize}
              value={useFileFacts}
              onChange={setUseFileFacts}
            />
          ) : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <VideoCompressionEstimatorForm
            value={effectiveInput}
            onChange={setInput}
          />
          <VideoCompressionEstimatorResults
            result={calculateVideoCompressionEstimate(effectiveInput)}
          />
        </div>
      </div>
    </section>
  );
}
