import type { SocialPublishingPlatformAnalyticsSummary } from "@/lib/clipstitchr/types/SocialPublishingPlatformAnalyticsSummary";
import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";

type SocialPublishingPlatformPerformanceProps = {
  summaries: SocialPublishingPlatformAnalyticsSummary[];
};

export function SocialPublishingPlatformPerformance({
  summaries,
}: SocialPublishingPlatformPerformanceProps) {
  return (
    <section className="min-w-0 rounded-lg bg-surface" aria-labelledby="platform-performance">
      <div className="p-5 sm:p-6">
        <h2 id="platform-performance" className="text-xl font-bold text-text-primary">
          Platform performance
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Compare the channels connected to this product.
        </p>
      </div>
      {summaries.length ? (
        <div
          className="max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          role="region"
          aria-label="Platform performance table"
          tabIndex={0}
        >
          <table className="min-w-[780px] w-full text-left text-sm">
            <thead className="bg-surface-muted text-text-tertiary">
              <tr>
                <th className="px-5 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 text-right font-semibold">Posts</th>
                <th className="px-4 py-3 text-right font-semibold">Views</th>
                <th className="px-4 py-3 text-right font-semibold">Reach</th>
                <th className="px-4 py-3 text-right font-semibold">Likes</th>
                <th className="px-4 py-3 text-right font-semibold">Saves</th>
                <th className="px-5 py-3 text-right font-semibold">Engaged</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.platform} className="border-t border-border text-text-secondary">
                  <th className="px-5 py-4 font-bold text-text-primary">
                    {getSocialPublishingPlatformLabel(summary.platform)}
                  </th>
                  <td className="px-4 py-4 text-right">{formatSocialPublishingNumber(summary.postCount)}</td>
                  <td className="px-4 py-4 text-right">{formatSocialPublishingNumber(summary.views)}</td>
                  <td className="px-4 py-4 text-right">{formatSocialPublishingNumber(summary.reach)}</td>
                  <td className="px-4 py-4 text-right">{formatSocialPublishingNumber(summary.likes)}</td>
                  <td className="px-4 py-4 text-right">{formatSocialPublishingNumber(summary.saves)}</td>
                  <td className="px-5 py-4 text-right">{summary.engagementRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 pb-6 text-sm font-semibold text-text-tertiary">
          Platform totals will appear after posts have results.
        </p>
      )}
    </section>
  );
}
