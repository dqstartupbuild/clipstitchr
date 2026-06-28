import { formatPostBridgeNumber } from "@/lib/clipstitchr/utils/formatPostBridgeNumber";

type PostBridgeAnalyticsMetricCellProps = {
  label: string;
  value: number;
};

export function PostBridgeAnalyticsMetricCell({
  label,
  value,
}: PostBridgeAnalyticsMetricCellProps) {
  return (
    <div>
      <p className="text-sm font-bold text-text-primary">
        {formatPostBridgeNumber(value)}
      </p>
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
    </div>
  );
}
