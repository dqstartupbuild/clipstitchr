import { Info, ListTodo, ThumbsUp } from "lucide-react";
import { ProductDemoReadinessPricingCta } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessPricingCta";
import { LocalVideoPreview } from "@/app/_components/tools/video/LocalVideoPreview";
import { VideoCheckRow } from "@/app/_components/tools/video/VideoCheckRow";
import { VideoInspectionFacts } from "@/app/_components/tools/video/VideoInspectionFacts";
import { VideoReadinessScoreCard } from "@/app/_components/tools/video/VideoReadinessScoreCard";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";
import type { ProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswers";
import type { ProductDemoUse } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoUse";
import { createProductDemoReadinessChecks } from "@/lib/clipstitchr/tools/productDemoReadiness/createProductDemoReadinessChecks";
import { getProductDemoOrientationAdvice } from "@/lib/clipstitchr/tools/productDemoReadiness/getProductDemoOrientationAdvice";
import { getProductDemoReadinessFixes } from "@/lib/clipstitchr/tools/productDemoReadiness/getProductDemoReadinessFixes";
import { getProductDemoReadinessStatus } from "@/lib/clipstitchr/tools/productDemoReadiness/getProductDemoReadinessStatus";

type ProductDemoReadinessResultsProps = {
  answers: ProductDemoAnswers;
  file: File;
  inspection: LocalVideoInspection;
  use: ProductDemoUse;
};

export function ProductDemoReadinessResults({
  answers,
  file,
  inspection,
  use,
}: ProductDemoReadinessResultsProps) {
  const checks = createProductDemoReadinessChecks({ answers, inspection, use });
  const score = scoreVideoChecks(checks);
  const status = getProductDemoReadinessStatus(score);
  const fixes = getProductDemoReadinessFixes(checks);
  const passes = checks.filter((check) => check.status === "pass");
  const orientationAdvice = getProductDemoOrientationAdvice(inspection);

  return (
    <div className="mt-8 grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <LocalVideoPreview file={file} />
        <div className="grid gap-5">
          <VideoReadinessScoreCard
            description="The score combines technical facts with the answers you can verify by watching. A private-data, phone-readability, or playback failure remains a blocker at any percentage."
            percentage={score.percentage}
            status={status}
          />
          <ProductDemoReadinessPricingCta />
        </div>
      </div>

      {orientationAdvice ? (
        <p className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-text-secondary">
          <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          {orientationAdvice}
        </p>
      ) : null}

      <VideoInspectionFacts inspection={inspection} />

      <div className="grid gap-5 lg:grid-cols-2">
        <section
          aria-labelledby="product-demo-fixes-heading"
          className="rounded-lg border border-border bg-surface-elevated p-5"
        >
          <h3
            id="product-demo-fixes-heading"
            className="flex items-center gap-2 text-lg font-bold text-text-primary"
          >
            <ListTodo aria-hidden className="h-5 w-5 text-accent-dark" />
            Three fixes to make next
          </h3>
          {fixes.length > 0 ? (
            <ol className="mt-4 grid gap-3">
              {fixes.map((check, index) => (
                <li
                  className="rounded-lg border border-border bg-white p-3 text-sm leading-6 text-text-secondary"
                  key={check.id}
                >
                  <span className="font-bold text-text-primary">
                    {index + 1}. {check.title}
                  </span>
                  <br />
                  {check.fix}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              No blockers remain in this checklist. Keep the current demo as a
              testable version and compare it with a meaningfully different
              opening.
            </p>
          )}
        </section>

        <section
          aria-labelledby="product-demo-passes-heading"
          className="rounded-lg border border-border bg-surface-elevated p-5"
        >
          <h3
            id="product-demo-passes-heading"
            className="flex items-center gap-2 text-lg font-bold text-text-primary"
          >
            <ThumbsUp aria-hidden className="h-5 w-5 text-emerald-700" />
            What already works
          </h3>
          {passes.length > 0 ? (
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-text-secondary">
              {passes.map((check) => (
                <li key={check.id}>• {check.title}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Confirm the checklist items below to build this list.
            </p>
          )}
        </section>
      </div>

      <section aria-labelledby="full-demo-checklist-heading">
        <h3
          id="full-demo-checklist-heading"
          className="text-2xl font-bold text-text-primary"
        >
          Full readiness checklist
        </h3>
        <div className="mt-5 grid gap-3">
          {checks.map((check) => (
            <VideoCheckRow check={check} key={check.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
