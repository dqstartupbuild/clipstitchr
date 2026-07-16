import { getBillingUsageHistoryAmountLabel } from "@/app/_components/settings/getBillingUsageHistoryAmountLabel";
import { getBillingUsageHistoryLabel } from "@/app/_components/settings/getBillingUsageHistoryLabel";
import type { BillingUsageHistoryEntry } from "@/app/_components/settings/types/BillingUsageHistoryEntry";

type BillingUsageHistoryProps = {
  entries: BillingUsageHistoryEntry[];
};

export function BillingUsageHistory({ entries }: BillingUsageHistoryProps) {
  if (!entries.length) {
    return (
      <p className="border-t border-border pt-4 text-sm text-text-secondary">
        Your credit and video activity will show here after your first use.
      </p>
    );
  }

  return (
    <details className="border-t border-border pt-4">
      <summary className="cursor-pointer text-sm font-bold text-text-primary">
        Recent usage
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-text-secondary">
            <tr>
              <th className="pb-2 font-semibold">When</th>
              <th className="pb-2 font-semibold">Activity</th>
              <th className="pb-2 font-semibold">Resource</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              return (
                <tr key={`${entry.createdAt}:${entry.operation}:${index}`}>
                  <td className="border-t border-border py-2 pr-3 text-text-secondary">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(entry.createdAt))}
                  </td>
                  <td className="border-t border-border py-2 pr-3 font-semibold text-text-primary">
                    {getBillingUsageHistoryLabel(entry)}
                  </td>
                  <td className="border-t border-border py-2 pr-3 text-text-secondary">
                    {entry.resource === "ai_video" ? "Video" : "Credits"}
                  </td>
                  <td className="border-t border-border py-2 text-right font-semibold text-text-primary">
                    {getBillingUsageHistoryAmountLabel(entry)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
