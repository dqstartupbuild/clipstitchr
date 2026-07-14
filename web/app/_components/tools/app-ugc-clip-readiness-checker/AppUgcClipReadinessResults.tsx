import { ListTodo, ThumbsUp } from "lucide-react";
import { PublicToolGateContentBoundary } from "@/app/_components/tools/gates/PublicToolGateContentBoundary";
import { AppUgcClipPricingCta } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipPricingCta";
import { LocalVideoPreview } from "@/app/_components/tools/video/LocalVideoPreview";
import { VideoCheckRow } from "@/app/_components/tools/video/VideoCheckRow";
import { VideoInspectionFacts } from "@/app/_components/tools/video/VideoInspectionFacts";
import { VideoReadinessScoreCard } from "@/app/_components/tools/video/VideoReadinessScoreCard";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import type { AppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswers";
import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { createAppUgcClipAutomaticChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipAutomaticChecks";
import { createAppUgcClipReadinessChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipReadinessChecks";
import { createAppUgcClipReviewChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipReviewChecks";
import { formatAppUgcClipReadinessReport } from "@/lib/clipstitchr/tools/appUgcClipReadiness/formatAppUgcClipReadinessReport";
import { getAppUgcClipReadinessFixes } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipReadinessFixes";
import { getAppUgcClipReadinessStatus } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipReadinessStatus";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppUgcClipReadinessResultsProps = {
  answers: AppUgcClipAnswers;
  file: File;
  inspection: LocalVideoInspection;
  role: AppUgcClipRole;
  variant?: PublicToolGateVariant;
};

export function AppUgcClipReadinessResults({
  answers,
  file,
  inspection,
  role,
  variant = "control",
}: AppUgcClipReadinessResultsProps) {
  const checks = createAppUgcClipReadinessChecks({ answers, inspection, role });
  const automaticChecks = createAppUgcClipAutomaticChecks(inspection, role);
  const reviewChecks = createAppUgcClipReviewChecks(answers, role);
  const score = scoreVideoChecks(checks);
  const status = getAppUgcClipReadinessStatus(score);
  const fixes = getAppUgcClipReadinessFixes(checks);
  const passes = checks.filter(
    (check) => check.status === "pass" && check.weight > 0,
  );

  const topIssue = fixes[0];

  return (
    <PublicToolGateContentBoundary
      hasFunctionalUnlock
      toolKey="app-ugc-clip-readiness-checker"
      variant={variant}
      publicContent={<div className="mt-8 grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <LocalVideoPreview file={file} />
        <div className="grid gap-5">
          <VideoReadinessScoreCard
            percentage={score.percentage}
            status={status}
            description="Technical facts come from the file. Framing, motion, voice quality, clean handles, modularity, edit treatment, and usage approval come only from your review."
          />
          <AppUgcClipPricingCta variant={variant} />
        </div>
      </div>
      <section className="rounded-lg border border-border p-5">
        <h3 className="flex items-center gap-2 font-bold text-text-primary">
          <ListTodo aria-hidden className="h-5 w-5 text-accent-dark" />
          Top issue
        </h3>
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          {topIssue ? (
            <>
              <strong className="text-text-primary">{topIssue.title}</strong>
              <br />
              {topIssue.fix}
            </>
          ) : (
            "No blocker remains in this checklist."
          )}
        </p>
      </section>
    </div>}
      unlockedContent={<div className="mt-8 grid gap-8">
      <CopyTextButton
        label="Copy clip report"
        copiedLabel="Clip report copied"
        text={formatAppUgcClipReadinessReport({
          checks,
          percentage: score.percentage,
          role,
          status,
        })}
      />
      <VideoInspectionFacts inspection={inspection} />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-border p-5">
          <h3 className="flex items-center gap-2 font-bold text-text-primary">
            <ListTodo aria-hidden className="h-5 w-5 text-accent-dark" />
            Three fixes to make next
          </h3>
          {fixes.length ? (
            <ol className="mt-4 grid gap-3">
              {fixes.map((check, index) => (
                <li
                  className="text-sm leading-6 text-text-secondary"
                  key={check.id}
                >
                  <strong className="text-text-primary">
                    {index + 1}. {check.title}
                  </strong>
                  <br />
                  {check.fix}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              No blocker remains in this checklist. Keep the clean source and
              confirm its approval before production.
            </p>
          )}
        </section>
        <section className="rounded-lg border border-border p-5">
          <h3 className="flex items-center gap-2 font-bold text-text-primary">
            <ThumbsUp aria-hidden className="h-5 w-5 text-emerald-700" />
            What already works
          </h3>
          <ul className="mt-4 grid gap-2 text-sm text-text-secondary">
            {passes.map((check) => (
              <li key={check.id}>• {check.title}</li>
            ))}
          </ul>
        </section>
      </div>
      <section aria-labelledby="ugc-automatic-checks-heading">
        <h3
          id="ugc-automatic-checks-heading"
          className="text-2xl font-bold text-text-primary"
        >
          Automatic file facts
        </h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          These checks use technical metadata only. They do not watch or listen
          to the content like a person.
        </p>
        <div className="mt-5 grid gap-3">
          {automaticChecks.map((check) => (
            <VideoCheckRow key={check.id} check={check} />
          ))}
        </div>
      </section>
      <section aria-labelledby="ugc-review-checks-heading">
        <h3
          id="ugc-review-checks-heading"
          className="text-2xl font-bold text-text-primary"
        >
          Your self-review
        </h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          These results reflect the answers you selected after watching the
          clip.
        </p>
        <div className="mt-5 grid gap-3">
          {reviewChecks.map((check) => (
            <VideoCheckRow key={check.id} check={check} />
          ))}
        </div>
      </section>
    </div>}
    />
  );
}
