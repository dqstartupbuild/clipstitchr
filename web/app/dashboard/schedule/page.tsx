import { SchedulePageClient } from "@/app/dashboard/schedule/SchedulePageClient";
import { SocialSchedulePageClient } from "@/app/dashboard/schedule/SocialSchedulePageClient";
import { getSocialPublishingProvider } from "@/lib/clipstitchr/social/getSocialPublishingProvider";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ legacy?: string | string[] }>;
}) {
  const provider = getSocialPublishingProvider();
  const params = await searchParams;
  const showLegacy = params.legacy === "1";

  if (provider === "post_bridge") {
    return <SchedulePageClient />;
  }

  return showLegacy ? (
    <SchedulePageClient readOnlyLegacy />
  ) : (
    <SocialSchedulePageClient />
  );
}
