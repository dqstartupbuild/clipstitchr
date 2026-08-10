import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";

type SocialPublishingAnalyticsStatCardProps = {
  label: string;
  value: number;
};

export function SocialPublishingAnalyticsStatCard({
  label,
  value,
}: SocialPublishingAnalyticsStatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">
        {formatSocialPublishingNumber(value)}
      </p>
    </div>
  );
}
