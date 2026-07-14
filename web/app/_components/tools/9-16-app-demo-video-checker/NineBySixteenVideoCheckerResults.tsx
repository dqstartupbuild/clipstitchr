import { Info } from "lucide-react";
import { LocalVideoPreview } from "@/app/_components/tools/video/LocalVideoPreview";
import { VideoCheckRow } from "@/app/_components/tools/video/VideoCheckRow";
import { VideoInspectionFacts } from "@/app/_components/tools/video/VideoInspectionFacts";
import { VideoReadinessScoreCard } from "@/app/_components/tools/video/VideoReadinessScoreCard";
import { NineBySixteenVideoCheckerPricingCta } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerPricingCta";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";
import { createNineBySixteenCompatibilityNotes } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/createNineBySixteenCompatibilityNotes";
import { createNineBySixteenVideoChecks } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/createNineBySixteenVideoChecks";
import { getNineBySixteenVideoStatus } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/getNineBySixteenVideoStatus";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type NineBySixteenVideoCheckerResultsProps = {
  file: File;
  inspection: LocalVideoInspection;
  variant?: PublicToolGateVariant;
};

export function NineBySixteenVideoCheckerResults({
  file,
  inspection,
  variant = "control",
}: NineBySixteenVideoCheckerResultsProps) {
  const checks = createNineBySixteenVideoChecks(inspection);
  const score = scoreVideoChecks(checks);
  const status = getNineBySixteenVideoStatus(score);
  const compatibilityNotes = createNineBySixteenCompatibilityNotes(inspection);

  return (
    <div className="mt-8 grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <LocalVideoPreview file={file} />
        <div className="grid gap-5">
          <VideoReadinessScoreCard
            description="This score uses ClipStitchr's durable production baseline. It is a practical preflight check, not certification for every ad network."
            percentage={score.percentage}
            status={status}
          />
          <NineBySixteenVideoCheckerPricingCta variant={variant} />
        </div>
      </div>

      <VideoInspectionFacts inspection={inspection} />

      {compatibilityNotes.length > 0 ? (
        <section
          aria-labelledby="compatibility-notes-heading"
          className="rounded-lg border border-blue-200 bg-blue-50 p-5"
        >
          <h3
            id="compatibility-notes-heading"
            className="flex items-center gap-2 font-bold text-text-primary"
          >
            <Info aria-hidden className="h-5 w-5 text-blue-700" />
            Compatibility notes
          </h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
            {compatibilityNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="video-checklist-heading">
        <h3
          id="video-checklist-heading"
          className="text-2xl font-bold text-text-primary"
        >
          Your video checklist
        </h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Passes are ready to keep. Warnings are worth reviewing. Failures
          need another export before this file is a dependable vertical demo.
        </p>
        <div className="mt-5 grid gap-3">
          {checks.map((check) => (
            <VideoCheckRow check={check} key={check.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
