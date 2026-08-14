import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";

type SocialPublishingAnalyticsStatCardProps = {
  label: string;
  value: number | string;
};

export function SocialPublishingAnalyticsStatCard({
  label,
  value,
}: SocialPublishingAnalyticsStatCardProps) {
  return (
    <div className="rounded-lg bg-surface-elevated p-4">
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">
        {typeof value === "number" ? formatSocialPublishingNumber(value) : value}
      </p>
    </div>
  );
}
