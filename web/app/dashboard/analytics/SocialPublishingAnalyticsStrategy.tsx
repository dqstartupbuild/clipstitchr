import { SocialPublishingBestTimesSection } from "@/app/dashboard/analytics/SocialPublishingBestTimesSection";
import { SocialPublishingContentLifespanSection } from "@/app/dashboard/analytics/SocialPublishingContentLifespanSection";
import { SocialPublishingFollowerGrowthSection } from "@/app/dashboard/analytics/SocialPublishingFollowerGrowthSection";
import { SocialPublishingPostingCadenceSection } from "@/app/dashboard/analytics/SocialPublishingPostingCadenceSection";
import type { SocialPublishingBestTimeSlot } from "@/lib/clipstitchr/types/SocialPublishingBestTimeSlot";
import type { SocialPublishingContentDecayBucket } from "@/lib/clipstitchr/types/SocialPublishingContentDecayBucket";
import type { SocialPublishingFollowerStats } from "@/lib/clipstitchr/types/SocialPublishingFollowerStats";
import type { SocialPublishingPostingFrequency } from "@/lib/clipstitchr/types/SocialPublishingPostingFrequency";

type SocialPublishingAnalyticsStrategyProps = {
  bestTimes: SocialPublishingBestTimeSlot[];
  contentDecay: SocialPublishingContentDecayBucket[];
  followerStats: SocialPublishingFollowerStats;
  postingFrequency: SocialPublishingPostingFrequency[];
};

export function SocialPublishingAnalyticsStrategy({
  bestTimes,
  contentDecay,
  followerStats,
  postingFrequency,
}: SocialPublishingAnalyticsStrategyProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <SocialPublishingBestTimesSection slots={bestTimes} />
      <SocialPublishingFollowerGrowthSection followerStats={followerStats} />
      <SocialPublishingPostingCadenceSection rows={postingFrequency} />
      <SocialPublishingContentLifespanSection buckets={contentDecay} />
    </div>
  );
}
