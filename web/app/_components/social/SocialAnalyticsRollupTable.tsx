import type { SocialAnalyticsReport } from "@/lib/clipstitchr/social/types/SocialAnalyticsReport";
import { formatSocialAnalyticsValue } from "@/lib/clipstitchr/social/analytics/formatSocialAnalyticsValue";

type SocialAnalyticsRollupTableProps = {
  label: string;
  rollups: SocialAnalyticsReport["productTotals"];
  showSign: boolean;
};

export function SocialAnalyticsRollupTable({
  label,
  rollups,
  showSign,
}: SocialAnalyticsRollupTableProps) {
  return (
    <details className="rounded-lg bg-surface">
      <summary className="cursor-pointer p-4 text-sm font-bold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        {label} ({rollups.length})
      </summary>
      <div className="overflow-x-auto border-t border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="text-text-tertiary">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Posts</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 font-semibold">Likes</th>
              <th className="px-4 py-3 font-semibold">Comments</th>
              <th className="px-4 py-3 font-semibold">Shares</th>
              <th className="px-4 py-3 font-semibold">Saves</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rollups.map((rollup) => (
              <tr key={rollup.id}>
                <th className="px-4 py-3 font-semibold text-text-primary">
                  {rollup.label}
                </th>
                <td className="px-4 py-3 text-text-secondary">
                  {rollup.publicationCount}
                </td>
                {(
                  ["views", "likes", "comments", "shares", "saves"] as const
                ).map((metric) => (
                  <td key={metric} className="px-4 py-3 text-text-secondary">
                    {formatSocialAnalyticsValue(
                      rollup.metrics[metric].value,
                      showSign,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rollups.length === 0 ? (
          <p className="p-4 text-sm text-text-secondary">No results yet.</p>
        ) : null}
      </div>
    </details>
  );
}
