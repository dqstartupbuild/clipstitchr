import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import { getPostBridgePlatformLabel } from "@/lib/clipstitchr/utils/getPostBridgePlatformLabel";

type ScheduledPostAccountListProps = {
  accountIds: number[];
  accounts: PostBridgeSocialAccount[];
};

export function ScheduledPostAccountList({
  accountIds,
  accounts,
}: ScheduledPostAccountListProps) {
  const accountById = new Map(accounts.map((account) => [account.id, account]));

  if (!accountIds.length) {
    return (
      <span className="text-xs font-semibold text-text-tertiary">
        No accounts selected
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {accountIds.map((accountId) => {
        const account = accountById.get(accountId);

        return (
          <span
            key={accountId}
            className="inline-flex max-w-full items-center rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-semibold text-text-secondary"
          >
            <span className="truncate">
              {account
                ? `${account.username} - ${getPostBridgePlatformLabel(account.platform)}`
                : `Account ${accountId}`}
            </span>
          </span>
        );
      })}
    </div>
  );
}
