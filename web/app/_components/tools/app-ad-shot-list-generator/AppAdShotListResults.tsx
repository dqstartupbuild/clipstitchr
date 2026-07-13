import { AppAdShotCard } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotCard";
import { AppAdShotListPricingCta } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListPricingCta";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdShotListResult } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListResult";
import { formatAppAdShotListText } from "@/lib/clipstitchr/tools/appAdShotList/formatAppAdShotListText";

type AppAdShotListResultsProps = { result: AppAdShotListResult };

export function AppAdShotListResults({ result }: AppAdShotListResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite">
        Shot list updated with {result.totalPlannedFiles} planned files.
      </p>
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            Copyable shoot-day plan
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {result.appName} capture list
          </h2>
          <p className="mt-2 text-sm font-semibold text-text-secondary">
            {result.totalPlannedFiles} planned files ·{" "}
            {result.totalRecommendedTakes} recommended on-set takes
          </p>
        </div>
        <CopyTextButton
          label="Copy shot list"
          copiedLabel="Shot list copied"
          text={formatAppAdShotListText(result)}
        />
      </div>
      <p className="mt-5 leading-7 text-text-secondary">{result.objective}</p>
      <div className="mt-6 grid gap-4">
        {result.shots.map((shot) => (
          <AppAdShotCard key={shot.id} shot={shot} />
        ))}
      </div>
      <section className="mt-6 rounded-lg border border-border bg-surface-muted/45 p-5">
        <h3 className="font-bold text-text-primary">On-set checklist</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
          {result.recordingChecklist.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>
      <AppAdShotListPricingCta />
    </Panel>
  );
}
