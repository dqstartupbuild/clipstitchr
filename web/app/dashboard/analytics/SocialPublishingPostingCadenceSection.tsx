import type { SocialPublishingPostingFrequency } from "@/lib/clipstitchr/types/SocialPublishingPostingFrequency";
import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";
import { getSocialPublishingBestPostingFrequency } from "@/lib/clipstitchr/utils/getSocialPublishingBestPostingFrequency";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";

type SocialPublishingPostingCadenceSectionProps = {
  rows: SocialPublishingPostingFrequency[];
};

export function SocialPublishingPostingCadenceSection({
  rows,
}: SocialPublishingPostingCadenceSectionProps) {
  const bestRows = getSocialPublishingBestPostingFrequency(rows);

  return (
    <section className="rounded-lg bg-surface p-5 sm:p-6" aria-labelledby="posting-cadence">
      <h2 id="posting-cadence" className="text-xl font-bold text-text-primary">
        Posting cadence
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        The weekly pace that produced the strongest average engagement on each channel.
      </p>
      {bestRows.length ? (
        <div className="mt-5 grid gap-1">
          {bestRows.map((row) => (
            <div
              key={row.platform}
              className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5"
            >
              <div>
                <p className="font-bold text-text-primary">
                  {getSocialPublishingPlatformLabel(row.platform)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Seen across {formatSocialPublishingNumber(row.weeksCount)} weeks
                </p>
              </div>
              <p className="text-sm font-semibold text-text-secondary">
                {row.postsPerWeek} posts/week · {row.averageEngagementRate.toFixed(1)}% engaged
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm font-semibold text-text-tertiary">
          A cadence recommendation needs several weeks of posting history.
        </p>
      )}
    </section>
  );
}
