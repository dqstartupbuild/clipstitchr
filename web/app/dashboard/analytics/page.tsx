import { PostBridgeAnalyticsPageClient } from "@/app/dashboard/analytics/PostBridgeAnalyticsPageClient";
import { SocialAnalyticsPageClient } from "@/app/dashboard/analytics/SocialAnalyticsPageClient";
import { getSocialPublishingProvider } from "@/lib/clipstitchr/social/getSocialPublishingProvider";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ legacy?: string | string[] }>;
}) {
  const provider = getSocialPublishingProvider();
  const params = await searchParams;
  const showLegacy = params.legacy === "1";

  if (provider === "post_bridge") {
    return <PostBridgeAnalyticsPageClient />;
  }

  return showLegacy ? (
    <PostBridgeAnalyticsPageClient readOnlyLegacy />
  ) : (
    <SocialAnalyticsPageClient />
  );
}
