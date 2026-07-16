import { Button } from "@/app/_components/ui/Button";

type BillingUsageSummaryProps = {
  activeGenerationLimit: number;
  activeGenerations: number;
  availableCredits: number;
  canBuyRefill: boolean;
  isBuyingRefill: boolean;
  monthlyRemaining: number;
  nextRefillExpiryAt?: string;
  refillRemaining: number;
  videoConsumed: number;
  videoLimit: number;
  videoReserved: number;
  onBuyRefill: () => void;
};

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(value))
    : null;
}

export function BillingUsageSummary({
  activeGenerationLimit,
  activeGenerations,
  availableCredits,
  canBuyRefill,
  isBuyingRefill,
  monthlyRemaining,
  nextRefillExpiryAt,
  refillRemaining,
  videoConsumed,
  videoLimit,
  videoReserved,
  onBuyRefill,
}: BillingUsageSummaryProps) {
  const refillExpiry = formatDate(nextRefillExpiryAt);

  return (
    <section
      className="grid gap-5 border-t border-border pt-5 md:grid-cols-3"
      aria-label="Current usage"
    >
      <div>
        <p className="text-sm font-semibold text-text-secondary">
          Creation credits
        </p>
        <p className="mt-1 text-2xl font-bold text-text-primary">
          {availableCredits.toLocaleString()}
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {monthlyRemaining.toLocaleString()} from this month
          {refillRemaining > 0
            ? ` + ${refillRemaining.toLocaleString()} refill credits`
            : ""}
          .
        </p>
        {refillExpiry ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Next refill expiry: {refillExpiry}
          </p>
        ) : null}
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          disabled={!canBuyRefill}
          isLoading={isBuyingRefill}
          onClick={onBuyRefill}
        >
          Add 2,000 credits for $29
        </Button>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-secondary">
          Clipr + Swapr videos
        </p>
        <p className="mt-1 text-2xl font-bold text-text-primary">
          {videoConsumed + videoReserved} / {videoLimit}
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {videoConsumed} finished
          {videoReserved > 0 ? `, ${videoReserved} in progress` : ""}. Refills
          do not add videos.
        </p>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-secondary">
          Active creations
        </p>
        <p className="mt-1 text-2xl font-bold text-text-primary">
          {activeGenerations} / {activeGenerationLimit}
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          A slot opens as soon as a creation finishes or stops.
        </p>
      </div>
    </section>
  );
}
