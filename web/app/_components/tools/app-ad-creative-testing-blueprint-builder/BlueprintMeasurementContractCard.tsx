import type { BlueprintMeasurementContract } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMeasurementContract";
import { formatBlueprintMetricValue } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/formatBlueprintMetricValue";

type BlueprintMeasurementContractCardProps = {
  contract: BlueprintMeasurementContract;
};

export function BlueprintMeasurementContractCard({
  contract,
}: BlueprintMeasurementContractCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-5">
      <h3 className="text-base font-bold text-text-primary">
        Measurement contract
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase text-text-tertiary">
            Metric
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {contract.primaryMetric}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-text-tertiary">
            Baseline
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {formatBlueprintMetricValue(contract.baseline)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-text-tertiary">
            Target
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {formatBlueprintMetricValue(contract.target)}
          </p>
        </div>
      </div>
      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        {contract.insufficientEvidenceMessage}
      </p>
      <ul className="mt-4 grid gap-1 text-sm leading-6 text-text-secondary">
        {contract.fairComparisonReminders.map((reminder) => (
          <li key={reminder}>• {reminder}</li>
        ))}
      </ul>
    </section>
  );
}
