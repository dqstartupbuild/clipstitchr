import { PublicToolGateActionBoundary } from "@/app/_components/tools/gates/PublicToolGateActionBoundary";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import { createCreativeTestingTrackerCsv } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingTrackerCsv";
import { createCreativeTestingTrackerMarkdown } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingTrackerMarkdown";

type CreativeTestingTrackerExportsProps = {
  experiments: readonly CreativeTestingExperiment[];
  hasFunctionalUnlock?: boolean;
  variant?: PublicToolGateVariant;
};

export function CreativeTestingTrackerExports({
  experiments,
  hasFunctionalUnlock = false,
  variant = "control",
}: CreativeTestingTrackerExportsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <PublicToolGateActionBoundary
        hasFunctionalUnlock={hasFunctionalUnlock}
        toolKey="tiktok-reels-creative-testing-tracker"
        variant={variant}
      >
        <ResourceDownloadButton
          contents={createCreativeTestingTrackerCsv(experiments)}
          fileName="clipstitchr-creative-testing-tracker.csv"
          label="Download CSV"
          type="text/csv;charset=utf-8"
        />
      </PublicToolGateActionBoundary>
      <ResourceDownloadButton
        contents={createCreativeTestingTrackerMarkdown(experiments)}
        fileName="clipstitchr-creative-testing-tracker.md"
        label="Download Markdown"
        type="text/markdown;charset=utf-8"
      />
    </div>
  );
}
