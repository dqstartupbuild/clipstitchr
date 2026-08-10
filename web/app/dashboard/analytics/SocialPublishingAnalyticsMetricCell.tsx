import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";

type SocialPublishingAnalyticsMetricCellProps = {
  label: string;
  value: number;
};

export function SocialPublishingAnalyticsMetricCell({
  label,
  value,
}: SocialPublishingAnalyticsMetricCellProps) {
  return (
    <div>
      <p className="text-sm font-bold text-text-primary">
        {formatSocialPublishingNumber(value)}
      </p>
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
    </div>
  );
}
