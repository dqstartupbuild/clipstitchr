import type { UgcCreatorRateComparisonRow } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonRow";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";

type UgcCreatorRateResultCardProps = {
  row: UgcCreatorRateComparisonRow;
};

export function UgcCreatorRateResultCard({
  row,
}: UgcCreatorRateResultCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            Entered quote
          </p>
          <h3 className="mt-1 text-xl font-bold text-text-primary">
            {row.label}
          </h3>
        </div>
        <p className="text-2xl font-bold text-text-primary">
          {formatUsd(row.totalCost)}
        </p>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-text-tertiary">Per deliverable</dt>
          <dd className="font-bold text-text-primary">
            {row.costPerDeliverable === null
              ? "Not available"
              : formatUsd(row.costPerDeliverable)}
          </dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Per usable clip</dt>
          <dd className="font-bold text-text-primary">
            {row.costPerUsableClip === null
              ? "Not available"
              : formatUsd(row.costPerUsableClip)}
          </dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Revisions entered</dt>
          <dd className="font-bold text-text-primary">
            {row.includedRevisionCount}
          </dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Usage entered</dt>
          <dd className="font-bold text-text-primary">
            {row.usageMonths > 0 ? `${row.usageMonths} months` : "Not entered"}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-text-secondary">
        Raw footage:{" "}
        {row.rawFootageIncluded
          ? "listed as included"
          : "not listed as included"}
        .
        {row.priceDifferenceFromMedian === null
          ? ""
          : ` Total is ${formatUsd(Math.abs(row.priceDifferenceFromMedian))} ${row.priceDifferenceFromMedian > 0 ? "above" : row.priceDifferenceFromMedian < 0 ? "below" : "from"} this entered set's median.`}
      </p>
    </article>
  );
}
