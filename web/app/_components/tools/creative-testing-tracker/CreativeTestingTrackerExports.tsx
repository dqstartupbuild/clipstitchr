import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import { createCreativeTestingTrackerCsv } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingTrackerCsv";
import { createCreativeTestingTrackerMarkdown } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingTrackerMarkdown";

type CreativeTestingTrackerExportsProps = {
  experiments: readonly CreativeTestingExperiment[];
};

export function CreativeTestingTrackerExports({
  experiments,
}: CreativeTestingTrackerExportsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ResourceDownloadButton
        contents={createCreativeTestingTrackerCsv(experiments)}
        fileName="clipstitchr-creative-testing-tracker.csv"
        label="Download CSV"
        type="text/csv;charset=utf-8"
      />
      <ResourceDownloadButton
        contents={createCreativeTestingTrackerMarkdown(experiments)}
        fileName="clipstitchr-creative-testing-tracker.md"
        label="Download Markdown"
        type="text/markdown;charset=utf-8"
      />
    </div>
  );
}
