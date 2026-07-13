import { ShortFormAuditDimensionCard } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditDimensionCard";
import { ShortFormAuditPlanDayCard } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditPlanDayCard";
import { ShortFormAuditPriorities } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditPriorities";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import { createPersonalizedShortFormAuditMarkdown } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/createPersonalizedShortFormAuditMarkdown";
import type { ShortFormAuditResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResult";

type ShortFormAuditResultsProps = {
  result: ShortFormAuditResult;
};

export function ShortFormAuditResults({ result }: ShortFormAuditResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Your self-audit"
        title={`${result.overallScore}/100 · ${result.scoreLabel}`}
        description="The score changes only when an answer changes. No hidden benchmark, account data, or performance model is involved."
        actions={
          <ResourceDownloadButton
            contents={createPersonalizedShortFormAuditMarkdown(result)}
            fileName="clipstitchr-short-form-content-audit.md"
            label="Download full audit"
            type="text/markdown;charset=utf-8"
          />
        }
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {result.dimensions.map((dimension) => (
          <ShortFormAuditDimensionCard
            dimension={dimension}
            key={dimension.dimension}
          />
        ))}
      </div>
      <ShortFormAuditPriorities result={result} />
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-2xl font-bold text-text-primary">
          Your dependency-ordered 14-day plan
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          The plan settles message and asset dependencies before production,
          testing, and learning work.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {result.plan.map((planDay) => (
            <ShortFormAuditPlanDayCard key={planDay.day} planDay={planDay} />
          ))}
        </div>
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This is a self-audit based only on your answers. It does not inspect
        accounts or media, verify assets, store files, create ads, or predict
        performance.
      </p>
    </Panel>
  );
}
