import type { SocialPublishingFollowerStats } from "@/lib/clipstitchr/types/SocialPublishingFollowerStats";
import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";

type SocialPublishingFollowerGrowthSectionProps = {
  followerStats: SocialPublishingFollowerStats;
};

export function SocialPublishingFollowerGrowthSection({
  followerStats,
}: SocialPublishingFollowerGrowthSectionProps) {
  return (
    <section className="rounded-lg bg-surface p-5 sm:p-6" aria-labelledby="follower-growth">
      <h2 id="follower-growth" className="text-xl font-bold text-text-primary">
        Follower growth
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Daily follower totals from each connected account.
      </p>
      {followerStats.accounts.length ? (
        <div className="mt-5 grid gap-1">
          {followerStats.accounts.map((account) => (
            <div
              key={account.accountId}
              className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5"
            >
              <div>
                <p className="font-bold text-text-primary">{account.username}</p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {getSocialPublishingPlatformLabel(account.platform)}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-secondary">
                {formatSocialPublishingNumber(account.currentFollowers)} followers
              </p>
              <p
                className={`text-sm font-bold ${account.growth >= 0 ? "text-success" : "text-amber-400"}`}
              >
                {account.growth >= 0 ? "+" : ""}
                {formatSocialPublishingNumber(account.growth)} ({account.growthPercentage.toFixed(1)}%)
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm font-semibold text-text-tertiary">
          Follower history will appear after Zernio records its first daily snapshot.
        </p>
      )}
    </section>
  );
}
