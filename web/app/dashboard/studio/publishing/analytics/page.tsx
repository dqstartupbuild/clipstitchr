import { PublishingAnalytics } from "@/app/_components/publishing/analytics/PublishingAnalytics";
import { readPublishingAnalyticsRangeSearchParam } from "@/lib/clipstitchr/publishing/client/readPublishingAnalyticsRangeSearchParam";

type PublishingAnalyticsPageProps = {
  searchParams?: Promise<{ range?: string | string[] }>;
};

export default async function PublishingAnalyticsPage({
  searchParams = Promise.resolve({}),
}: PublishingAnalyticsPageProps = {}) {
  const { range } = await searchParams;
  return (
    <PublishingAnalytics
      initialRange={readPublishingAnalyticsRangeSearchParam(range)}
    />
  );
}
