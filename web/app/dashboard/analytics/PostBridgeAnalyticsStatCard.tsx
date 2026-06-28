import { formatPostBridgeNumber } from "@/lib/clipstitchr/utils/formatPostBridgeNumber";

type PostBridgeAnalyticsStatCardProps = {
  label: string;
  value: number;
};

export function PostBridgeAnalyticsStatCard({
  label,
  value,
}: PostBridgeAnalyticsStatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">
        {formatPostBridgeNumber(value)}
      </p>
    </div>
  );
}
