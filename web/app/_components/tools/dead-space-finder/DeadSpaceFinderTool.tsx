"use client";

import { useState } from "react";
import { DeadSpaceFinderResults } from "@/app/_components/tools/dead-space-finder/DeadSpaceFinderResults";
import { DeadSpaceFinderSettings } from "@/app/_components/tools/dead-space-finder/DeadSpaceFinderSettings";
import { LocalVideoDropzone } from "@/app/_components/tools/video/LocalVideoDropzone";
import { LocalVideoPreview } from "@/app/_components/tools/video/LocalVideoPreview";
import { defaultDeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/defaultDeadSpaceAnalysisOptions";
import type { DeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysisOptions";
import { useDeadSpaceAnalysis } from "@/lib/clipstitchr/tools/deadSpaceFinder/useDeadSpaceAnalysis";

export function DeadSpaceFinderTool() {
  const [options, setOptions] = useState<DeadSpaceAnalysisOptions>(
    defaultDeadSpaceAnalysisOptions,
  );
  const { analysis, analyzeFile, errorMessage, file, isAnalyzing } =
    useDeadSpaceAnalysis();

  return (
    <section className="px-6 py-16 md:py-20" aria-label="Dead-space finder">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="grid gap-6">
          <DeadSpaceFinderSettings
            disabled={isAnalyzing}
            onChange={setOptions}
            value={options}
          />
          <LocalVideoDropzone
            emptyPrompt="Drop one short app-ad video here"
            errorMessage={errorMessage}
            file={file}
            inputId="dead-space-video"
            isInspecting={isAnalyzing}
            onFile={(nextFile) => void analyzeFile(nextFile, options)}
          />
          {file && !isAnalyzing ? (
            <button
              className="h-11 rounded-lg border border-accent px-4 text-sm font-bold text-accent-dark hover:bg-accent/5"
              onClick={() => void analyzeFile(file, options)}
              type="button"
            >
              Analyze again with these settings
            </button>
          ) : null}
        </div>
        <div className="grid gap-6">
          {file ? <LocalVideoPreview file={file} /> : null}
          {analysis ? (
            <DeadSpaceFinderResults analysis={analysis} />
          ) : (
            <div className="marketing-card p-6 text-sm leading-7 text-text-secondary">
              Choose a video up to three minutes and 200 MB. The browser samples
              small frames and decoded audio locally, then lists spans where
              both signals stay low.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
